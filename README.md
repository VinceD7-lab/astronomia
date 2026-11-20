# Astronomia — projet de départ

Nouvelle version du cours d’astronomie de Jacques Gispert ([astronomia.fr](https://astronomia.fr)), construite avec [Astro](https://astro.build). Ce dépôt contient la page d’accueil de la maquette, découpée en composants, et un chapitre pilote : **Le calendrier**.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:4321/astronomia/ (la recherche n’existe qu’après un build)
npm run build      # compile le site dans dist/ puis indexe le texte avec Pagefind
npm run preview    # sert dist/ pour tester le site construit, recherche comprise
npm test           # vérifie les calculs du calendrier (jour julien, Pâques 1583-2500…)
```

## Publier avec Git, sans domaine

1. Créez un dépôt GitHub (par exemple `astronomia`) et poussez ce projet sur la branche `main`.
2. Dans le dépôt : **Settings › Pages › Source : GitHub Actions**.
3. Chaque `git push` publie le site sur `https://<utilisateur>.github.io/<depot>/`. Le workflow `.github/workflows/deploy.yml` déduit l’adresse du dépôt : il n’y a rien à régler.

Pour construire à la main avec une autre adresse : `SITE=https://exemple.org BASE=/ npm run build`. Tous les liens internes passent par `src/lib/url.ts` et suivent `BASE`.

## Organisation

| Dossier | Rôle |
|---|---|
| `src/pages/index.astro` | Page d’accueil : assemble les composants |
| `src/components/` | `Ouverture`, `EchelleDistances`, `ListeParties`, `Animations`, `Balance`, `Annexes`, `Barre`, `Pied`, `Sommaire`, `Recherche` |
| `src/components/chapitre/` | Outils des chapitres : `Encadre`, `ASuivre`, `Almanach`, `ConvertisseurJulien` |
| `src/content/chapitres/` | **Un fichier .mdx par chapitre** : `partie-1/calendrier.mdx` → `/partie-1/calendrier/` |
| `src/data/*.json` | Parties, chapitres, animations, repères de l’échelle, pesanteurs (extraits de la maquette) |
| `src/data/cours.ts` | Liste des pages déjà migrées (`locales`), liens et chapitres voisins |
| `src/lib/comput.ts` | Calculs du calendrier, sans dépendance, testés par `npm test` |
| `src/styles/` | `global.css` (jetons de couleur, thème clair/sombre), `chapitre.css` |
| `scripts/` | `importer-chapitre.py` (import d’un chapitre), `extraire-maquette.mjs` |

Tant qu’un chapitre n’est pas migré, ses liens (accueil, sommaire, recherche) pointent vers astronomia.fr. Un chapitre migré porte la pastille « nouvelle version ».

## Migrer un chapitre

```bash
pip install requests beautifulsoup4 markdownify
python3 scripts/importer-chapitre.py https://astronomia.fr/1ere_partie/distances.php --partie 1 --nom distances
```

Le script écrit le fichier MDX, télécharge les images dans `src/assets/distances/` et affiche une liste de points à relire (titres, tableaux, formules, images sans texte alternatif, animations). Si le site refuse la requête, enregistrez la page puis utilisez `--html fichier.html --chemin 1ere_partie/distances.php`.

Ensuite :

1. Rédigez le `resume` dans l’en-tête du fichier et relisez le texte.
2. Les formules s’écrivent en LaTeX entre `$$ … $$` (rendues en MathML, sans feuille de style).
3. Ajoutez le chapitre dans `locales` (`src/data/cours.ts`) et, pour garder les anciens liens, dans `redirects` (`astro.config.mjs`).
4. Les encadrés (`<Encadre type="def|retenir|hist|plus">`) et les sections encore à faire (`<ASuivre ancre="…" />`) s’importent en tête de fichier depuis `src/components/chapitre/`.

## État du chapitre pilote « Le calendrier »

- **Structure** : les 6 grandes parties et 53 sous-sections du chapitre d’origine, avec leurs ancres.
- **Réécrit** : grégorien, règle solaire, cycle de Méton, jour julien (+ modifié, durée, jour de la semaine), comput, bissextile, cycle solaire, indiction, nombre d’or, lettre dominicale, épacte, pleine lune pascale, Pâques et almanach. Les formules viennent de Jean Meeus, *Astronomical Algorithms* ; les textes sont rédigés pour ce projet, pas copiés du site.
- **À migrer** : les autres sections (histoire des calendriers, calendrier julien, république, etc.) portent la mention « Section à migrer » avec un lien vers la page d’origine. Elles se remplacent par le texte de l’auteur, à importer avec le script.
- **Convention** : l’épacte est l’âge de la Lune ecclésiastique au 1er janvier, calculé par l’algorithme de Meeus. À comparer avec la définition retenue par l’auteur dans son chapitre.

## Limites connues

- Les 40 animations de l’accueil renvoient encore vers les pages d’origine (applets Java, JavaScript). Elles sont à réécrire en Canvas, une par une.
- La couverture du livre est une évocation dessinée, à remplacer par l’image réelle.
- Les résumés de parties et leurs portées en distance sont des propositions à valider avec l’auteur.
