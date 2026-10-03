"""JSON Schema subset plus cross-file semantic validation; stdlib only."""
import datetime as dt
import re
from urllib.parse import urlparse

class ValidationError(ValueError):
    pass

def require(condition, message):
    if not condition:
        raise ValidationError(message)

def validate_schema(value, schema, path='$'):
    types = {'object': dict, 'array': list, 'string': str, 'boolean': bool, 'null': type(None), 'integer': int, 'number': (int,float)}
    expected = schema.get('type')
    if expected:
        expected = expected if isinstance(expected, list) else [expected]
        require(any(isinstance(value, types[t]) and not (t in ('integer','number') and isinstance(value,bool)) for t in expected), f'{path}: type')
    if 'enum' in schema:
        require(value in schema['enum'], f'{path}: enum')
    if isinstance(value, str):
        require(len(value) >= schema.get('minLength', 0), f'{path}: empty')
        if schema.get('pattern'):
            require(re.search(schema['pattern'], value), f'{path}: pattern')
        if schema.get('format') == 'uri':
            require(urlparse(value).scheme in ('https','http') and urlparse(value).netloc, f'{path}: URL')
    if isinstance(value, dict):
        for key in schema.get('required', []):
            require(key in value, f'{path}: missing {key}')
        for key, entry in value.items():
            if key in schema.get('properties', {}):
                validate_schema(entry, schema['properties'][key], path+'.'+key)
            elif schema.get('additionalProperties') is False:
                raise ValidationError(f'{path}: unexpected {key}')
    if isinstance(value, list):
        require(len(value) >= schema.get('minItems', 0), f'{path}: too few items')
        if schema.get('uniqueItems'):
            require(len({repr(x) for x in value}) == len(value), f'{path}: duplicate items')
        for i, item in enumerate(value):
            validate_schema(item, schema.get('items', {}), f'{path}[{i}]')

def validate_events(events, catalog, schema):
    entities = {e['id'] for e in catalog['entities']}
    sources = {s['id']: s for s in catalog['sources']}
    ids = [e['id'] for e in events]
    require(len(ids) == len(set(ids)), '事件标识重复')
    for event in events:
        validate_schema(event, schema)
        require(set(event['entity_ids']) <= entities, f"{event['id']}: 未登记关注对象")
        require(event['date_precision'] in ('date','datetime','unknown'), '时间精度无效')
        for stamp in [event['first_collected_at'],event['updated_at'],*[s['collected_at'] for s in event['sources']],*[c['at'] for c in event.get('corrections',[])]]:
            try:
                parsed_stamp=dt.datetime.fromisoformat(stamp.replace('Z','+00:00'))
            except (ValueError,TypeError) as exc:
                raise ValidationError('采集或更正时间无效') from exc
            require(parsed_stamp.tzinfo is not None,'采集或更正时间必须带时区')
        published = event['published_at']
        if published:
            try:
                parsed = dt.datetime.fromisoformat(published.replace('Z','+00:00'))
            except (ValueError, TypeError) as exc:
                raise ValidationError('事件时间无效') from exc
            require(event['date_precision'] != 'unknown', '已知时间不能使用 unknown')
            require((len(published)==10) == (event['date_precision']=='date'), '日期精度不一致')
            if event['date_precision']=='datetime':
                require(parsed.tzinfo is not None, '时间必须带时区')
        else:
            require(event['date_precision']=='unknown', '未知时间精度错误')
        require(set(event.get('related_event_ids', [])) <= set(ids), '关联事件不存在')
        require(event['id'] not in event.get('related_event_ids', []), '事件不能关联自身')
        for evidence in event['sources']:
            source = sources.get(evidence['source_id'])
            require(source is not None, '来源不存在')
            require(source.get('verification') == 'verified', '未核实来源不可发布')
            require(set(event['entity_ids']).intersection(source['entity_ids']), '事件与来源关注对象不匹配')
            require(evidence.get('material_scope') in ('metadata_only','partial_text','full_text'), '来源材料范围错误')
