"""Build canonical sitemaps using content history, never the build clock."""
import re
import subprocess
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9'
ET.register_namespace('', NAMESPACE)


def page_inputs(root):
    shared = ['public/assets/' + name for name in
              ('style.css', 'i18n.js', 'privacy.js', 'analytics.js', 'mark.svg')]
    pages = {}
    for page in sorted((root / 'public').glob('*.html')):
        canonical = re.search(r'<link rel="canonical" href="([^"]+)"', page.read_text())
        if not canonical:
            raise ValueError(f'Missing canonical: {page.name}')
        inputs = [page.relative_to(root).as_posix(), *shared]
        if page.name == 'index.html':
            inputs += ['public/assets/' + name for name in
                       ('app.js', 'model.js', 'render.js', 'pricing.js')]
            inputs += [path.relative_to(root).as_posix() for path in
                       (root / 'public/data').glob('*.json')]
            inputs += [path.relative_to(root).as_posix() for path in
                       (root / 'public/data/events').glob('*.json')]
            inputs += ['scripts/prerender.mjs', 'scripts/build-pricing.mjs']
        else:
            inputs += ['public/assets/legal.js']
        pages[canonical.group(1)] = inputs
    return pages


def last_modified(root, inputs, fallback):
    history = subprocess.run(['git', 'log', '-1', '--format=%cI', '--', *inputs],
                             cwd=root, capture_output=True, text=True)
    dates = [history.stdout.strip() or fallback]
    changed = subprocess.run(['git', 'status', '--porcelain', '--', *inputs],
                             cwd=root, capture_output=True, text=True)
    if changed.returncode == 0:
        for line in changed.stdout.splitlines():
            path = root / line[3:]
            if path.is_file():
                dates.append(datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat())
    return max(dates, key=lambda value: datetime.fromisoformat(value).astimezone(timezone.utc))


def build_sitemaps(root, destination):
    existing = ET.parse(root / 'public/sitemap.xml')
    fallback = {node.find(f'{{{NAMESPACE}}}loc').text:
                node.find(f'{{{NAMESPACE}}}lastmod').text for node in existing.getroot()}
    sitemap = ET.Element(f'{{{NAMESPACE}}}urlset')
    dates = []
    for url, inputs in page_inputs(root).items():
        modified = last_modified(root, inputs, fallback[url])
        dates.append(modified)
        node = ET.SubElement(sitemap, f'{{{NAMESPACE}}}url')
        ET.SubElement(node, f'{{{NAMESPACE}}}loc').text = url
        ET.SubElement(node, f'{{{NAMESPACE}}}lastmod').text = modified
    index = ET.Element(f'{{{NAMESPACE}}}sitemapindex')
    node = ET.SubElement(index, f'{{{NAMESPACE}}}sitemap')
    ET.SubElement(node, f'{{{NAMESPACE}}}loc').text = 'https://go2-ai.com/sitemap.xml'
    ET.SubElement(node, f'{{{NAMESPACE}}}lastmod').text = max(
        dates, key=lambda value: datetime.fromisoformat(value).astimezone(timezone.utc))
    for filename, tree in [('sitemap.xml', sitemap), ('sitemap_index.xml', index)]:
        ET.indent(tree)
        ET.ElementTree(tree).write(destination / filename, encoding='UTF-8', xml_declaration=True)
