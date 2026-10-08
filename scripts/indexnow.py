"""Notify IndexNow after deployment; preview the exact URL list with --dry-run."""
import argparse
import json
import os
import re
import subprocess
import time
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen

from build_seo import page_inputs


def payload(root, base=''):
    key = (root / 'public/indexnow-key.txt').read_text().strip()
    if not re.fullmatch(r'[a-zA-Z0-9-]{8,128}', key):
        raise ValueError('Invalid IndexNow key')
    pages = page_inputs(root)
    if base and set(base) != {'0'}:
        diff = subprocess.run(['git', 'diff', '--name-only', base, 'HEAD', '--', 'public', 'scripts'],
                              cwd=root, capture_output=True, text=True, check=True)
        changed = set(diff.stdout.splitlines())
        urls = [url for url, inputs in pages.items() if changed.intersection(inputs)]
    else:
        urls = list(pages)
    return {'host': 'go2-ai.com', 'key': key,
            'keyLocation': 'https://go2-ai.com/indexnow-key.txt', 'urlList': urls}


def submit(data):
    # The new ownership file must already be public before sending a notification.
    for attempt in range(3):
        try:
            with urlopen(data['keyLocation'], timeout=15) as response:
                if response.read().decode().strip() != data['key']:
                    raise ValueError('Published IndexNow key does not match; deploy the current build first')
            break
        except URLError:
            if attempt == 2:
                raise
            time.sleep(5)
    request = Request('https://api.indexnow.org/indexnow',
                      data=json.dumps(data).encode(),
                      headers={'Content-Type': 'application/json; charset=utf-8'})
    with urlopen(request, timeout=30) as response:
        if response.status not in (200, 202):
            raise ValueError(f'Unexpected IndexNow response: {response.status}')
        return response.status


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    data = payload(Path(__file__).resolve().parents[1], os.environ.get('INDEXNOW_BASE', ''))
    if args.dry_run:
        print(json.dumps(data, indent=2))
    elif data['urlList']:
        status = submit(data)
        print(f'IndexNow HTTP {status}: {len(data["urlList"])} URLs received; indexing is not guaranteed')
    else:
        print('No changed canonical pages; skipping IndexNow')
