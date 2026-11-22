/** Vérifie les calculs des modèles antiques (src/lib/cosmogonie.ts). Lancé par `npm test`. */
import { centreEpicycle, planete, retrogradations, longitudeSphere, SPHERES, joursDepuisJ2000 } from '../src/lib/cosmogonie.ts';

let echecs = 0;
function verifie(nom: string, ok: boolean, detail = '') {
  if (!ok) { echecs++; console.error(`ÉCHEC  ${nom} ${detail}`); }
}
const proche = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;

// Le centre de l’épicycle reste toujours sur le déférent (cercle unité), avec ou sans équant.
for (const e of [0, 0.1, 0.25, 0.4]) {
  for (let i = 0; i < 360; i += 7) {
    const c = centreEpicycle((i * Math.PI) / 180, e);
    verifie(`centre sur le déférent (e=${e}, a=${i}°)`, proche(Math.hypot(c.x, c.y), 1, 1e-12));
  }
}

// Sans excentricité, l’équant est au centre : l’angle du centre est l’angle donné.
{
  const c = centreEpicycle(1, 0);
  verifie('e = 0 : centre à l’angle donné', proche(Math.atan2(c.y, c.x), 1));
}

// Vu depuis l’équant, le centre de l’épicycle est bien dans la direction demandée.
{
  const e = 0.3, a = 2.2, c = centreEpicycle(a, e);
  verifie('équant : direction uniforme', proche(Math.atan2(c.y, c.x + e), a));
}

// La planète est à la distance r du centre de l’épicycle.
{
  const p = { r: 0.4, k: 3, e: 0.2 };
  const c = centreEpicycle(0.7, p.e), P = planete(0.7, p);
  verifie('planète sur l’épicycle', proche(Math.hypot(P.x - c.x, P.y - c.y), 0.4));
}

// Avec un épicycle assez grand, on retrouve la règle des textes de l’auteur : k − 1 rétrogradations par tour.
for (let k = 1; k <= 8; k++) {
  const n = retrogradations({ r: 0.6, k, e: 0 });
  verifie(`k − 1 rétrogradations (k=${k})`, n === k - 1, `: ${n}`);
}
// Avec un petit épicycle, la vitesse varie mais la planète ne rebrousse pas chemin.
verifie('petit épicycle : pas de rétrogradation', retrogradations({ r: 0.1, k: 2, e: 0 }) === 0);
// Réglage de Ptolémée pour Mars : une seule rétrogradation par révolution synodique, avec ou sans équant.
verifie('Ptolémée (k=2), sans équant', retrogradations({ r: 0.6, k: 2, e: 0 }) === 1);
verifie('Ptolémée (k=2), avec équant', retrogradations({ r: 0.6, k: 2, e: 0.2 }) === 1);

// Sphères : longitudes entre 0 et 360, Soleil à 280,466° à J2000, Mercure et Vénus jamais loin du Soleil.
{
  const soleil = SPHERES.find((s) => s.nom === 'Soleil')!;
  verifie('Soleil à J2000', proche(longitudeSphere(soleil, 0), 280.466, 1e-9));
  verifie('J2000 = 0', proche(joursDepuisJ2000(new Date(Date.UTC(2000, 0, 1, 12))), 0));
  for (const nom of ['Mercure', 'Vénus']) {
    const s = SPHERES.find((x) => x.nom === nom)!;
    let max = 0;
    for (let j = 0; j < 3000; j += 3) {
      const d = Math.abs(((longitudeSphere(s, j) - longitudeSphere(soleil, j) + 540) % 360) - 180);
      max = Math.max(max, d);
    }
    verifie(`${nom} reste près du Soleil`, max <= s.elongation!.max + 1e-9, `: ${max.toFixed(1)}°`);
  }
  for (const s of SPHERES) {
    const l = longitudeSphere(s, -12345.6);
    verifie(`${s.nom} : longitude entre 0 et 360`, l >= 0 && l < 360);
  }
}

if (echecs) { console.error(`\ncosmogonie.ts : ${echecs} échec(s)`); process.exit(1); }
console.log('cosmogonie.ts : tous les tests passent');
