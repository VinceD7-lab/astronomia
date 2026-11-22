// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Sans domaine propre, le site vit dans un sous-dossier de GitHub Pages :
// https://<utilisateur>.github.io/<depot>/ . Renseignez ces deux valeurs
// (ou les variables SITE et BASE au moment du build).
const SITE = process.env.SITE ?? 'https://votre-utilisateur.github.io';
const BASE = process.env.BASE ?? '/astronomia/';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [mdx()],
  // Anciennes adresses du site actuel → nouvelles pages (à garder cohérent avec `locales` dans src/data/cours.ts).
  // (Astro n'ajoute pas `base` aux destinations : on le fait ici.)
  redirects: {
    '/1ere_partie/calendrier/calendrier.php': `${BASE.replace(/\/$/, '')}/partie-1/calendrier/`,
    '/1ere_partie/calendrier/calculCalendrier.php': `${BASE.replace(/\/$/, '')}/partie-1/calendrier/#almanach`,
    '/1ere_partie/cosmoAntique.php': `${BASE.replace(/\/$/, '')}/partie-1/cosmogonie-antique/`,
    '/1ere_partie/cosmoAntique_java/epicycles_java/ptolemee.html': `${BASE.replace(/\/$/, '')}/partie-1/cosmogonie-antique/#almageste`,
    '/1ere_partie/cosmoAntique_java/equant_java/equant.html': `${BASE.replace(/\/$/, '')}/partie-1/cosmogonie-antique/#equants`,
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      // Formules en MathML natif : aucune feuille de style ni police supplémentaire.
      rehypePlugins: [[rehypeKatex, { output: 'mathml' }]],
    }),
  },
});
