#!/usr/bin/env python3
import os
import argparse
from datetime import datetime

def find_html_files(root_dir):
    pages = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for f in filenames:
            if f.endswith('.html'):
                rel = os.path.relpath(os.path.join(dirpath, f), root_dir).replace('\\', '/')
                pages.append(rel)
    return sorted(pages)

def build_sitemap(base_url, pages):
    now = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    urls = []
    for p in pages:
        if p.startswith('.'):
            continue
        loc = base_url.rstrip('/') + '/' + p
        pri = '1.0' if p in ('index.html',) else '0.8'
        urls.append(f"  <url>\n    <loc>{loc}</loc>\n    <lastmod>{now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>{pri}</priority>\n  </url>")
    body = "\n".join(urls)
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{body}
</urlset>
"""

def main():
    parser = argparse.ArgumentParser(description='Generate sitemap.xml from project HTML files.')
    parser.add_argument('--base', required=True, help='Base URL, e.g., https://example.com')
    parser.add_argument('--root', default='.', help='Project root directory')
    parser.add_argument('--out', default='sitemap.xml', help='Output sitemap file path')
    args = parser.parse_args()

    pages = find_html_files(args.root)
    xml = build_sitemap(args.base, pages)
    with open(args.out, 'w', encoding='utf-8') as f:
        f.write(xml)
    print(f"Generated {args.out} with {len(pages)} pages")

if __name__ == '__main__':
    main()