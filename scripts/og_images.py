"""
Images de partage (Open Graph) des pages de projet : 1200 × 630 px, une par
projet et par langue, enregistrées dans `assets/img/og/<langue>-<projet>.jpg`.

À relancer seulement quand un titre de projet change :

    npm run build && python3 scripts/og_images.py

Demande Python 3 et Playwright (`pip install playwright`). Le rendu reprend
les polices, les couleurs et la carte topographique du site, pour que
l'aperçu d'un lien partagé ressemble à la page.
"""

import json
import pathlib
import sys

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'src' / 'content'
OUT = ROOT / 'assets' / 'img' / 'og'

TEMPLATE = """<!doctype html><meta charset="utf-8">
<style>
  @font-face {{ font-family: Archivo; src: url('{root}/assets/fonts/archivo-latin-standard-normal.woff2'); font-weight: 100 900; font-stretch: 62% 125%; }}
  html, body {{ margin: 0; width: 1200px; height: 630px; background: #d8d6ce; font-family: Archivo, sans-serif; color: #1c231d; }}
  .map {{ position: absolute; inset: 0; color: #84674a; opacity: .35; }}
  .map svg {{ width: 100%; height: 100%; }}
  .text {{ position: absolute; left: 72px; right: 72px; bottom: 72px; }}
  .kicker {{ font-size: 28px; font-stretch: 90%; color: #46523f; margin: 0 0 16px; }}
  h1 {{ font-size: 76px; line-height: 1.02; font-weight: 700; font-stretch: 82%; letter-spacing: -0.02em; margin: 0; max-width: 20ch; }}
  .author {{ position: absolute; left: 72px; top: 64px; font-size: 28px; font-weight: 600; }}
</style>
<div class="map">{map}</div>
<div class="author">{author}</div>
<div class="text"><p class="kicker">{kicker}</p><h1>{title}</h1></div>
"""


def main() -> None:
    site = json.loads((CONTENT / 'site.json').read_text(encoding='utf-8'))
    OUT.mkdir(parents=True, exist_ok=True)
    # La carte est insérée telle quelle : un masque CSS vers un fichier local
    # ne s'affiche pas dans le navigateur sans serveur.
    contours = (ROOT / 'assets' / 'contours' / 'projects-wide.svg').read_text(encoding='utf-8').replace('stroke="#000"', 'stroke="currentColor"', 1)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page(viewport={'width': 1200, 'height': 630})
        for lang in ('fr', 'en'):
            texts = json.loads((CONTENT / f'{lang}.json').read_text(encoding='utf-8'))
            for slug in site['projectOrder']:
                item = texts['projects']['items'][slug]
                title = item['title'].replace("'", '’')
                html = TEMPLATE.format(root=ROOT.as_uri(), map=contours, author=site['author'], kicker=item['kicker'], title=title)
                # Un fichier sur disque, pas `set_content` : une page vierge ne
                # peut pas charger les polices et la carte locales.
                card = OUT / '_card.html'
                card.write_text(html, encoding='utf-8')
                page.goto(card.as_uri(), wait_until='networkidle')
                page.screenshot(path=str(OUT / f'{lang}-{slug}.jpg'), type='jpeg', quality=85)
                card.unlink()
                print(f'{lang}-{slug}.jpg', file=sys.stderr)
        browser.close()


if __name__ == '__main__':
    main()
