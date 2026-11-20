// Extrait les données (parties, animations, repères…) de la maquette HTML vers src/data/*.json.
// Usage : node scripts/extraire-maquette.mjs chemin/vers/astronomia.html
import { readFileSync, writeFileSync } from 'node:fs';
const html = readFileSync(process.argv[2], 'utf8');
const bloc = (nom) => {
  const m = html.match(new RegExp(`var ${nom}=(\\[[\\s\\S]*?\\n?\\]);`));
  if (!m) throw new Error(`introuvable : ${nom}`);
  return (0, eval)(`(${m[1]})`);
};
const parties = bloc('PARTIES').map((p) => ({
  n: p.n, id: p.id, titre: p.titre, portee: p.portee, resume: p.resume,
  chapitres: p.ch.map(([titre, chemin, sous]) => (sous ? { titre, chemin, sous } : { titre, chemin })),
}));
const animations = bloc('ANIMS').map(([partie, titre, chemin, motif]) => ({ partie, titre, chemin, motif }));
const outils = bloc('OUTILS').map(([titre, chemin]) => ({ titre, chemin }));
const repères = bloc('REPERES').map(([nom, metres, texte]) => ({ nom, metres, texte }));
const bandes = bloc('BANDES').map(([libelle, cible, debut, fin, rang]) => ({ libelle, cible, debut, fin, rang }));
const astres = bloc('ASTRES').map(([nom, g]) => ({ nom, g }));
const sortie = { parties, animations, outils, reperes: repères, bandes, astres };
for (const [k, v] of Object.entries(sortie)) writeFileSync(new URL(`../src/data/${k}.json`, import.meta.url), JSON.stringify(v, null, 1) + '\n');
console.log(Object.entries(sortie).map(([k, v]) => `${k}: ${v.length}`).join(' · '));
