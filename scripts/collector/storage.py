"""Local, resumable materials and snapshots. No model calls."""
import contextlib
import datetime as dt
import fcntl
import hashlib
import json
import os
import shutil
import tempfile
from pathlib import Path

UTC = dt.timezone.utc
RULES_VERSION = '1'
PARSER_VERSION = '3'

def now_iso():
    return dt.datetime.now(UTC).isoformat(timespec='seconds')

def parse_time(value):
    if not value:
        return None
    try:
        parsed = dt.datetime.fromisoformat(str(value).replace('Z', '+00:00'))
        return parsed.replace(tzinfo=UTC) if parsed.tzinfo is None else parsed.astimezone(UTC)
    except (ValueError, TypeError):
        return None

def digest(value):
    return hashlib.sha256(value.encode('utf-8')).hexdigest()

def read_json(path, default=None):
    if not Path(path).exists():
        return default
    return json.loads(Path(path).read_text(encoding='utf-8'))

def write_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd,name=tempfile.mkstemp(prefix=path.name+'.',suffix='.tmp',dir=path.parent)
    temp=Path(name)
    try:
        with os.fdopen(fd,'w',encoding='utf-8') as handle:
            handle.write(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
        os.replace(temp,path)
    finally:
        temp.unlink(missing_ok=True)

class Store:
    def __init__(self, root):
        self.root = Path(root).resolve()
        self.work = self.root / '.collector'
        self.work.mkdir(parents=True, exist_ok=True)
        for name in ('materials', 'cache', 'runs'):
            (self.work / name).mkdir(exist_ok=True)

    @contextlib.contextmanager
    def lock(self):
        with (self.work / '.lock').open('w') as handle:
            fcntl.flock(handle, fcntl.LOCK_EX)
            try:
                yield
            finally:
                fcntl.flock(handle, fcntl.LOCK_UN)

    def state(self):
        return read_json(self.work / 'state.json', {'sources': {}})

    def materials(self):
        return read_json(self.work / 'materials.json', {})

    def decisions(self):
        return read_json(self.work / 'decisions.json', {})

    def save_material(self, source, record):
        text = record.pop('text', '')
        material_id = digest(source['id'] + '\n' + record['content_id'])[:24]
        fingerprint = digest(json.dumps({k:record.get(k) for k in ('title','published_at','date_kind','date_label','url','material_scope','prerelease')},sort_keys=True,ensure_ascii=False) + '\n' + text)
        material = {**record, 'id': material_id, 'source_id': source['id'],
                    'entity_ids': source['entity_ids'], 'platform': source['platform'],
                    'fingerprint': fingerprint, 'parser_version': PARSER_VERSION,
                    'collected_at': now_iso(), 'text_path': f'.collector/materials/{material_id}.txt'}
        (self.root / material['text_path']).write_text(text, encoding='utf-8')
        return material

    def pending(self, entity_ids=None, rules_version=None):
        if rules_version is None:
            rules_version = str(read_json(self.root / 'config/collection.json', {}).get('rules_version', RULES_VERSION))
        decisions = self.decisions()
        result = []
        for material in self.materials().values():
            if entity_ids and not set(material['entity_ids']).intersection(entity_ids):
                continue
            decision = decisions.get(material['id'], {})
            if (decision.get('fingerprint') == material['fingerprint']
                    and decision.get('rules_version') == rules_version
                    and decision.get('parser_version') == material['parser_version']
                    and decision.get('action') in ('keep', 'reject')):
                continue
            result.append(material)
        return sorted(result, key=lambda x: x.get('published_at') or '', reverse=True)

    def save_pending(self, rules_version=None):
        text = '\n'.join(json.dumps(m, ensure_ascii=False) for m in self.pending(rules_version=rules_version))
        path = self.work / 'pending.jsonl'
        path.write_text(text + ('\n' if text else ''), encoding='utf-8')

    def snapshot(self):
        data = self.root / 'public/data'
        catalog = read_json(data / 'catalog.json', {'entities': [], 'sources': [], 'people': []})
        index = read_json(data / 'index.json', {'months': [], 'event_locations': {}})
        coverage = read_json(data / 'coverage.json', {'sources': []})
        events = []
        for month in index.get('months', []):
            events.extend(read_json(data / month['path'], {'events': []})['events'])
        return catalog, index, coverage, events

    def replace_snapshot(self, files, internal=None):
        """Stage all outputs; roll back public AND private state on commit failure."""
        data = self.root / 'public/data'
        data.parent.mkdir(parents=True, exist_ok=True)
        stage = Path(tempfile.mkdtemp(prefix='snapshot-', dir=self.work))
        backup = self.work / 'previous-snapshot'
        old_internal = {name: (self.work / name).read_bytes() if (self.work / name).exists() else None
                        for name in (internal or {})}
        moved = False
        installed = False
        try:
            # Pricing is maintained independently of the news snapshot.
            for name in ('pricing.json', 'pricing.xml'):
                if name not in files and (data / name).is_file():
                    shutil.copy2(data / name, stage / name)
            for name, value in files.items():
                if isinstance(value,str):
                    target=stage/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(value,encoding='utf-8')
                else:
                    write_json(stage / name, value)
            if backup.exists():
                shutil.rmtree(backup)
            if data.exists():
                os.replace(data, backup)
                moved = True
            os.replace(stage, data)
            installed = True
            for name, value in (internal or {}).items():
                write_json(self.work / name, value)
        except BaseException:
            if data.exists() and installed:
                shutil.rmtree(data)
            if moved and backup.exists():
                os.replace(backup, data)
            for name, raw in old_internal.items():
                path = self.work / name
                if raw is None:
                    path.unlink(missing_ok=True)
                else:
                    path.write_bytes(raw)
            raise
        finally:
            if stage.exists():
                shutil.rmtree(stage)
        if backup.exists():
            shutil.rmtree(backup)
