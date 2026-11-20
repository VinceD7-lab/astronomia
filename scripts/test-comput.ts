// Vérifie lib/comput.ts sur des valeurs de référence. Lancer : npm test
import assert from 'node:assert/strict';
import * as c from '../src/lib/comput.ts';

// Jour julien (Meeus, exemples du chapitre 7)
assert.equal(c.jourJulien(2000, 1, 1.5), 2451545.0);
assert.equal(c.jourJulien(1987, 1, 27), 2446822.5);
assert.equal(c.jourJulien(1987, 6, 19.5), 2446966.0);
assert.equal(c.jourJulien(1957, 10, 4.81), 2436116.31);
assert.equal(c.jourJulien(333, 1, 27.5, 'julien'), 1842713.0);
assert.equal(c.jourJulien(1582, 10, 4, 'julien'), c.JJ_REFORME);
assert.equal(c.jourJulien(1582, 10, 15), c.JJ_REFORME + 1);
// Retour
for (const [jj, an, m, j] of [[2451544.5, 2000, 1, 1], [2299159.5, 1582, 10, 4], [2299160.5, 1582, 10, 15], [1842712.5, 333, 1, 27]] as const) {
  const d = c.dateDepuisJJ(jj); assert.deepEqual([d.an, d.mois, d.jour], [an, m, j], String(jj));
}
// Jour de la semaine
assert.equal(c.JOURS[c.jourSemaine(c.jourJulien(2000, 1, 1))], 'samedi');
assert.equal(c.JOURS[c.jourSemaine(c.jourJulien(1789, 7, 14))], 'mardi');
assert.equal(c.JOURS[c.jourSemaine(c.jourJulien(1582, 10, 15))], 'vendredi');
assert.equal(c.JOURS[c.jourSemaine(c.jourJulien(1582, 10, 4, 'julien'))], 'jeudi');
// Pâques (dates publiées)
const P: Record<number, [number, number]> = { 1818: [3, 22], 1943: [4, 25], 1961: [4, 2], 2000: [4, 23], 2011: [4, 24], 2019: [4, 21], 2024: [3, 31], 2025: [4, 20], 2026: [4, 5], 2027: [3, 28], 2038: [4, 25], 1583: [4, 10], 2285: [3, 22] };
for (const [an, [m, j]] of Object.entries(P)) { const p = c.paques(+an); assert.deepEqual([p.mois, p.jour], [m, j], `Pâques ${an}`); }
// Pleine lune pascale
assert.deepEqual(c.pleineLunePascale(2026), { mois: 4, jour: 2 });
assert.deepEqual(c.pleineLunePascale(2025), { mois: 4, jour: 13 });
assert.deepEqual(c.pleineLunePascale(2000), { mois: 4, jour: 18 });
// Pâques ne tombe jamais hors du 22 mars - 25 avril, sur 1583-2500
for (let an = 1583; an <= 2500; an++) {
  const p = c.paques(an), jj = c.jourJulien(an, p.mois, p.jour);
  assert.equal(c.jourSemaine(jj), 0, `dimanche ${an}`);
  assert.ok((p.mois === 3 && p.jour >= 22) || (p.mois === 4 && p.jour <= 25), `bornes ${an}`);
}
// Cycles et lettres
assert.equal(c.nombreOr(2026), 13); assert.equal(c.cycleSolaire(2026), 18); assert.equal(c.indictionRomaine(2026), 4);
assert.equal(c.cycleSolaire(1980), 28); assert.equal(c.indictionRomaine(2022), 15);
assert.deepEqual(c.lettresDominicales(2026), ['D']); assert.deepEqual(c.lettresDominicales(2025), ['E']);
assert.deepEqual(c.lettresDominicales(2024), ['G', 'F']); assert.deepEqual(c.lettresDominicales(2000), ['B', 'A']);
assert.equal(c.epacte(2026), 11); assert.equal(c.epacte(2025), 0); assert.equal(c.epacte(2014), 29);
// Bissextiles
assert.deepEqual([1900, 2000, 2024, 2100].map((a) => c.estBissextile(a)), [false, true, true, false]);
assert.equal(c.estBissextile(1900, 'julien'), true);
// Fêtes mobiles 2026
const f = c.fetesMobiles(2026);
assert.deepEqual(f.cendres, { mois: 2, jour: 18 }); assert.deepEqual(f.ascension, { mois: 5, jour: 14 }); assert.deepEqual(f.pentecote, { mois: 5, jour: 24 });
console.log('comput.ts : tous les tests passent');
