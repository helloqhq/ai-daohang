import json
import os
import subprocess
import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
from unittest.mock import patch
from urllib.error import URLError

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from build_seo import NAMESPACE, build_sitemaps, page_inputs
from indexnow import payload, submit


class SEOTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        public = self.root / 'public'
        (public / 'data/events').mkdir(parents=True)
        (public / 'assets').mkdir()
        (public / 'index.html').write_text('<link rel="canonical" href="https://go2-ai.com/">')
        (public / 'contact.html').write_text('<link rel="canonical" href="https://go2-ai.com/contact.html">')
        (public / 'data/index.json').write_text('{}')
        (public / 'indexnow-key.txt').write_text('12345678abcdef12')
        (public / 'sitemap.xml').write_text(f'<urlset xmlns="{NAMESPACE}"><url><loc>https://go2-ai.com/</loc><lastmod>2026-10-03</lastmod></url><url><loc>https://go2-ai.com/contact.html</loc><lastmod>2026-10-03</lastmod></url></urlset>')
        self.git('init', '-q')
        self.commit('initial', '2026-10-03T08:00:00+00:00')
        self.destination = self.root / 'dist'
        self.destination.mkdir()

    def git(self, *args, env=None):
        return subprocess.run(['git', *args], cwd=self.root, env=env, check=True,
                              capture_output=True, text=True).stdout.strip()

    def commit(self, message, at):
        self.git('add', 'public')
        env = dict(os.environ, GIT_AUTHOR_DATE=at, GIT_COMMITTER_DATE=at)
        self.git('-c', 'user.name=Test', '-c', 'user.email=test@example.com',
                 'commit', '-qm', message, env=env)

    def sitemap(self):
        build_sitemaps(self.root, self.destination)
        return {node.find(f'{{{NAMESPACE}}}loc').text:
                node.find(f'{{{NAMESPACE}}}lastmod').text
                for node in ET.parse(self.destination / 'sitemap.xml').getroot()}

    def test_dates_survive_rebuild_and_unrelated_commits(self):
        first = self.sitemap()
        self.assertEqual(first, self.sitemap())
        (self.root / 'README.md').write_text('unrelated')
        self.git('add', 'README.md')
        self.git('-c', 'user.name=Test', '-c', 'user.email=test@example.com',
                 'commit', '-qm', 'docs')
        self.assertEqual(first, self.sitemap())
        self.assertEqual({datetime.fromisoformat(value) for value in first.values()},
                         {datetime.fromisoformat('2026-10-03T08:00:00+00:00')})

    def test_data_changes_only_update_homepage_and_indexnow_list(self):
        base = self.git('rev-parse', 'HEAD')
        (self.root / 'public/data/events/2026-10.json').write_text('{"events":[]}')
        self.commit('news', '2026-10-08T03:00:00+00:00')
        dates = self.sitemap()
        self.assertEqual(datetime.fromisoformat(dates['https://go2-ai.com/']),
                         datetime.fromisoformat('2026-10-08T03:00:00+00:00'))
        self.assertEqual(datetime.fromisoformat(dates['https://go2-ai.com/contact.html']),
                         datetime.fromisoformat('2026-10-03T08:00:00+00:00'))
        self.assertEqual(payload(self.root, base)['urlList'], ['https://go2-ai.com/'])
        self.assertEqual(payload(self.root, self.git('rev-parse', 'HEAD'))['urlList'], [])

    def test_uncommitted_content_dates_and_shared_language_changes(self):
        base = self.git('rev-parse', 'HEAD')
        source = self.root / 'public/assets/i18n.js'
        source.write_text('updated translations')
        os.utime(source, (1791428400, 1791428400))
        self.assertEqual(len(set(self.sitemap().values())), 1)
        self.assertTrue(all(value.startswith('2026-10-08') for value in self.sitemap().values()))
        self.commit('translations', '2026-10-08T03:00:00+00:00')
        self.assertEqual(len(payload(self.root, base)['urlList']), 2)

    def test_only_canonical_pages_are_submitted_and_ownership_is_checked_first(self):
        data = payload(self.root, '0' * 40)
        self.assertEqual(set(data['urlList']), set(page_inputs(self.root)))
        self.assertTrue(all('?' not in url and '#' not in url for url in data['urlList']))
        with patch('indexnow.urlopen') as network:
            network.return_value.__enter__.return_value.read.return_value = b'wrong key'
            with self.assertRaises(ValueError):
                submit(data)
            self.assertEqual(network.call_count, 1)
        with patch('indexnow.urlopen') as network:
            response = network.return_value.__enter__.return_value
            response.read.return_value = data['key'].encode()
            response.status = 202
            self.assertEqual(submit(data), 202)
            request = network.call_args.args[0]
            self.assertEqual(json.loads(request.data), data)

    def test_source_snapshot_does_not_require_git(self):
        import shutil
        shutil.rmtree(self.root / '.git')
        self.assertEqual(set(self.sitemap().values()), {'2026-10-03'})

    def test_unpublished_key_retries_without_notifying_search_engines(self):
        with patch('indexnow.urlopen', side_effect=URLError('not published yet')) as network:
            with patch('indexnow.time.sleep') as sleep:
                with self.assertRaises(URLError):
                    submit(payload(self.root))
                self.assertEqual(network.call_count, 3)
                self.assertEqual(sleep.call_count, 2)
                self.assertTrue(all(isinstance(call.args[0], str) for call in network.call_args_list))


if __name__ == '__main__':
    unittest.main()
