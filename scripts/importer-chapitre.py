#!/usr/bin/env python3
"""
Importe un chapitre d'astronomia.fr vers un fichier MDX du projet.

    pip install requests beautifulsoup4 markdownify
    python3 scripts/importer-chapitre.py https://astronomia.fr/1ere_partie/distances.php --partie 1 --nom distances
    python3 scripts/importer-chapitre.py --html distances.html --partie 1 --nom distances --chemin 1ere_partie/distances.php

Ce que fait le script : récupère la page (ou lit un fichier enregistré), convertit le corps en Markdown,
télécharge les images dans src/assets/<nom>/ et écrit src/content/chapitres/partie-N/<nom>.mdx.
Ce qu'il ne fait pas : il ne devine pas le sens des titres ni des animations. Relisez toujours le résultat
(liste de contrôle affichée à la fin), puis ajoutez le chapitre à `locales` dans src/data/cours.ts.
"""
import argparse, re, sys
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from markdownify import MarkdownConverter

RACINE = Path(__file__).resolve().parent.parent
ORIGINE = 'https://astronomia.fr/'


def charger(args):
    if args.html:
        brut = Path(args.html).read_bytes()
        base = ORIGINE + (args.chemin or '')
    else:
        r = requests.get(args.url, timeout=30, headers={'User-Agent': 'astronomia-migration/0.1'})
        r.raise_for_status()
        brut, base = r.content, args.url
    # Les anciennes pages sont parfois en ISO-8859-1 : on essaie UTF-8, puis on se rabat dessus.
    try:
        texte = brut.decode('utf-8')
    except UnicodeDecodeError:
        texte = brut.decode('iso-8859-1')
    return BeautifulSoup(texte, 'html.parser'), base


class Convertisseur(MarkdownConverter):
    """Titres ATX, tableaux conservés, images listées pour téléchargement."""
    def __init__(self, base, dossier_img, rapport, **kw):
        super().__init__(**kw)
        self.base, self.dossier_img, self.rapport = base, dossier_img, rapport

    def convert_img(self, el, text, parent_tags=None, **kw):
        src = el.get('src')
        if not src:
            return ''
        absolu = urljoin(self.base, src)
        nom = Path(urlparse(absolu).path).name
        if nom in ('fleche.gif', 'flecheCourbe.gif'):  # icônes décoratives du site actuel
            return ''
        alt = (el.get('alt') or '').strip()
        if not alt:
            self.rapport['sans_alt'].append(nom)
        self.rapport['images'][nom] = absolu
        return f'![{alt}](../../../assets/{self.dossier_img}/{nom})'

    def convert_a(self, el, text, parent_tags=None, **kw):
        href = el.get('href')
        if not href:
            return text
        if href.startswith('#'):
            return f'[{text}]({href})'
        absolu = urljoin(self.base, href)
        if absolu.startswith(ORIGINE) and absolu.split('#')[0].endswith(('.html', '.php')):
            self.rapport['liens_internes'].add(absolu.replace(ORIGINE, ''))
        return f'[{text}]({absolu})'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('url', nargs='?')
    ap.add_argument('--html', help='page déjà enregistrée sur le disque')
    ap.add_argument('--chemin', help="chemin sur astronomia.fr (obligatoire avec --html), ex. 1ere_partie/distances.php")
    ap.add_argument('--partie', type=int, required=True)
    ap.add_argument('--nom', required=True, help='nom du fichier, sans extension (devient l’adresse)')
    ap.add_argument('--titre', help='titre du chapitre (sinon : premier <h1> ou <title>)')
    ap.add_argument('--sans-images', action='store_true', help='ne pas télécharger les images')
    args = ap.parse_args()
    if not args.url and not args.html:
        ap.error('donnez une URL ou --html')
    if args.html and not args.chemin:
        ap.error('--html demande --chemin')

    soupe, base = charger(args)
    chemin = args.chemin or base.replace(ORIGINE, '')
    for t in soupe(['script', 'style', 'noscript', 'nav', 'iframe']):
        t.decompose()
    corps = soupe.find(id=re.compile('^(contenu|content|texte)$', re.I)) or soupe.body or soupe
    titre = args.titre or (soupe.find('h1') or soupe.find('title') or soupe).get_text(' ', strip=True)

    for h1 in corps.find_all('h1'):  # le titre est affiché par le gabarit
        h1.decompose()
    titre = titre.replace('"', '’')

    rapport = {'sans_alt': [], 'images': {}, 'liens_internes': set()}
    md = Convertisseur(base, args.nom, rapport, heading_style='ATX', bullets='-').convert_soup(corps)
    md = re.sub(r'\n{3,}', '\n\n', md).strip() + '\n'
    md = md.replace('{', '&#123;').replace('}', '&#125;')          # { } ont un sens en MDX
    md = re.sub(r'<(?![a-zA-Z/!])', '&lt;', md)                    # un « < » isolé aussi

    sortie = RACINE / f'src/content/chapitres/partie-{args.partie}/{args.nom}.mdx'
    sortie.parent.mkdir(parents=True, exist_ok=True)
    front = f'---\ntitle: "{titre}"\npartie: {args.partie}\nchemin: {chemin}\nresume: "À RÉDIGER : une ou deux phrases"\n---\n\n'
    sortie.write_text(front + md, encoding='utf-8')

    if rapport['images'] and not args.sans_images:
        dossier = RACINE / 'src/assets' / args.nom
        dossier.mkdir(parents=True, exist_ok=True)
        for nom, url in rapport['images'].items():
            try:
                r = requests.get(url, timeout=30); r.raise_for_status()
                (dossier / nom).write_bytes(r.content)
            except Exception as e:
                print(f'  ! image non téléchargée : {url} ({e})', file=sys.stderr)

    print(f'écrit : {sortie.relative_to(RACINE)}  ({len(md.split())} mots)')
    print('\nÀ vérifier :')
    print('  1. le titre, le résumé et les niveaux de titres (le gabarit numérote h2 puis h3) ;')
    print('  2. les tableaux et les formules (les écrire en $$ … $$ si besoin) ;')
    print(f'  3. {len(rapport["sans_alt"])} image(s) sans texte alternatif : {", ".join(sorted(set(rapport["sans_alt"]))) or "aucune"} ;')
    print('  4. les animations (Java, Flash, JS) : ce sont des liens ou des blocs à réécrire à part ;')
    if rapport['liens_internes']:
        print('  5. liens vers d’autres pages du cours (à passer en liens locaux quand ils sont migrés) :')
        for l in sorted(rapport['liens_internes']): print('       -', l)
    print(f"  6. ajouter dans src/data/cours.ts, `locales` : '{chemin}': '/partie-{args.partie}/{args.nom}/'")
    print('     et la redirection correspondante dans astro.config.mjs.')


if __name__ == '__main__':
    main()
