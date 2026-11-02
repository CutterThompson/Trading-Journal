# Rebuilds the website (index.html at the repository root) from source/nq_journal.src.html.
#   python3 source/build_site.py
# The page is one file: the font and favicon are embedded, the Firebase settings are inlined.
# nqfb.js (the Firebase bridge) only needs rebuilding if source/bridge/nqfb-entry.js changes:
#   cd source/bridge && npm install && npm run build   (then copy nqfb.bundle.js over ../../nqfb.js, keeping its licence line)
import base64, json, pathlib
SRC = pathlib.Path(__file__).resolve().parent
ROOT = SRC.parent
html = (SRC / 'nq_journal.src.html').read_text(encoding='utf-8')
font = base64.b64encode((SRC / 'assets/mona-sans.woff2').read_bytes()).decode()
fav = (SRC / 'assets/favicon.b64').read_text().strip()
assert html.count('__FONT_B64__') == 1 and html.count('__FAVICON_B64__') == 1
html = html.replace('__FONT_B64__', font).replace('__FAVICON_B64__', fav)
cfg = json.loads((SRC / 'firebase-config.json').read_text())
viewport_old = '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
assert html.count(viewport_old) == 1
html = html.replace(viewport_old, '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">')
head_add = '''
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#171614">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="NQ Journal">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<script>window.NQ_FIREBASE_CONFIG = ''' + json.dumps(cfg) + ''';</script>
<script src="nqfb.js"></script>'''
html = html.replace('</title>', '</title>' + head_add, 1)
(ROOT / 'index.html').write_text(html, encoding='utf-8')
print('index.html rebuilt,', len(html), 'bytes')
