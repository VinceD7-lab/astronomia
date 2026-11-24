/** Vérifie les calculs de mécanique (src/lib/mecanique.ts). Lancé par `npm test`. */
import { anomalieExcentrique, etatKepler, pointEllipse, ellipse, tirHorizontal } from '../src/lib/mecanique.ts';

let echecs = 0;
function verifie(nom: string, ok: boolean, detail = '') {
  if (!ok) { echecs++; console.error(`ÉCHEC  ${nom} ${detail}`); }
}
const proche = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;

// Équation de Kepler : M = E − e sin E, pour toutes les excentricités utilisées (jusqu’à 0,95).
for (const e of [0, 0.1, 0.5, 0.9, 0.95]) {
  for (let i = 0; i < 64; i++) {
    const M = (2 * Math.PI * i) / 64, E = anomalieExcentrique(M, e);
    verifie(`Kepler e=${e} M=${M.toFixed(2)}`, proche(E - e * Math.sin(E), M, 1e-11));
  }
}

// Périhélie et aphélie : q = a (1 − e), Q = a (1 + e) ; vitesses dans le rapport Q / q.
{
  const e = 0.5, p = etatKepler(0, e), A = etatKepler(Math.PI, e);
  verifie('périhélie', proche(p.r, 1 - e));
  verifie('aphélie', proche(A.r, 1 + e));
  verifie('vitesses périhélie / aphélie', proche(p.v / A.v, (1 + e) / (1 - e)));
}

// Loi des aires : la vitesse aréolaire ½ r² dν/dt est constante.
{
  const e = 0.7, dM = 1e-6;
  const areolaire = (M: number) => {
    const a = etatKepler(M, e), b = etatKepler(M + dM, e);
    let dnu = b.nu - a.nu; if (dnu < -Math.PI) dnu += 2 * Math.PI;
    return 0.5 * a.r * a.r * dnu / dM;
  };
  const ref = Math.sqrt(1 - e * e) / 2;      // aire de l’ellipse π a b, parcourue en 2π
  for (const M of [0.1, 1, 2, 3, 4, 5, 6]) verifie(`loi des aires M=${M}`, proche(areolaire(M), ref, 1e-5), `: ${areolaire(M)} / ${ref}`);
}

// Énergie : v²/2 − 1/r = −1/2 (a = 1, GM = 1) tout le long de l’orbite.
for (const M of [0, 1, 2, 3]) {
  const s = etatKepler(M, 0.6);
  verifie(`énergie M=${M}`, proche(s.v * s.v / 2 - 1 / s.r, -0.5, 1e-12));
}

// Ellipse du jardinier : la somme des distances aux deux foyers vaut 2a en tout point.
for (const e of [0, 0.3, 0.8]) {
  const { c } = ellipse(2, e);
  for (let i = 0; i < 12; i++) {
    const P = pointEllipse(2, e, i);
    verifie(`ficelle e=${e}`, proche(Math.hypot(P.x - c, P.y) + Math.hypot(P.x + c, P.y), 4, 1e-12));
  }
}

// Tir horizontal : distance horizontale proportionnelle au temps, chute proportionnelle au carré du temps.
{
  const a = tirHorizontal(3, 10, 1), b = tirHorizontal(3, 10, 2);
  verifie('mouvement uniforme', proche(b.x, 2 * a.x));
  verifie('chute en t²', proche(b.y, 4 * a.y));
}

if (echecs) { console.error(`\nmecanique.ts : ${echecs} échec(s)`); process.exit(1); }
console.log('mecanique.ts : tous les tests passent');
