/** Vérifie les calculs du chapitre « Les distances » (src/lib/distances.ts). Lancé par `npm test`. */
import {
  rapportSoleilLune, avancePremierQuartier, distanceParallaxe, distanceModule, moduleDistance, magnitudeCepheide,
  distanceComobile, distancePropre, distanceLuminosite, distanceAngulaire, age, tempsRegard, PLANCK, PC_AL, PC_KM,
} from '../src/lib/distances.ts';

let echecs = 0;
function verifie(nom: string, ok: boolean, detail = '') {
  if (!ok) { echecs++; console.error(`ÉCHEC  ${nom} ${detail}`); }
}
const relatif = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol * Math.abs(b);

// Aristarque : 3° → environ 19 fois (« 20 fois ») ; angle réel 0,148° → environ 387 fois.
verifie('Aristarque 3°', relatif(rapportSoleilLune(3), 19.1, 0.01), `: ${rapportSoleilLune(3)}`);
verifie('angle réel', relatif(rapportSoleilLune(0.148), 387, 0.01), `: ${rapportSoleilLune(0.148)}`);
// 3° d’avance correspondent à environ 6 h (la valeur d’Aristarque).
verifie('avance de 6 h pour 3°', relatif(avancePremierQuartier(3), 5.9, 0.02), `: ${avancePremierQuartier(3)}`);

// Parallaxe : 61 Cygni, 0,287″ → 3,48 pc ≈ 11,4 al.
verifie('61 Cygni', relatif(distanceParallaxe(0.2872), 3.48, 0.01));
verifie('pc en al', relatif(PC_AL, 3.26, 0.001));
verifie('pc en km', relatif(PC_KM, 3.086e13, 0.001));

// Module de distance : une étoile de M = 5 à 250 pc apparaît vers m = 12 ; à 10 000 pc vers m = 20 (texte de l’auteur).
verifie('M=5 à 250 pc', Math.abs(5 + moduleDistance(250) - 12) < 0.05, `: ${5 + moduleDistance(250)}`);
verifie('M=5 à 10 kpc', Math.abs(5 + moduleDistance(10000) - 20) < 0.01);
verifie('aller-retour module', relatif(distanceModule(5 + moduleDistance(1234), 5), 1234, 1e-12));

// Céphéides : δ Céphée (P = 5,366 j, ⟨V⟩ = 3,95) est à 273 pc (parallaxe Hubble). Sans corriger
// l’absorption interstellaire (A_V ≈ 0,2), la loi donne environ 8 % de trop : on tolère 10 %.
{
  const d = distanceModule(3.95, magnitudeCepheide(5.366));
  verifie('δ Céphée', relatif(d, 273, 0.1), `: ${d.toFixed(0)} pc`);
}

// Cosmologie : âge de l’Univers ≈ 13,8 milliards d’années avec les paramètres de Planck.
verifie('âge Planck', relatif(age(0, PLANCK), 13.8, 0.01), `: ${age(0, PLANCK)}`);
// Cas de référence (H0 = 70, Ωm = 0,3, ΩΛ = 0,7, sans rayonnement) : z = 1 → d_C ≈ 3 303 Mpc, d_L ≈ 6 607 Mpc, d_A ≈ 1 652 Mpc.
{
  const c = { H0: 70, Om: 0.3, OL: 0.7 };
  verifie('d_C(1)', relatif(distanceComobile(1, c), 3303, 0.003), `: ${distanceComobile(1, c)}`);
  verifie('d_L(1)', relatif(distanceLuminosite(1, c), 6607, 0.003));
  verifie('d_A(1)', relatif(distanceAngulaire(1, c), 1652, 0.003));
  verifie('âge 13,47', relatif(age(0, c), 13.47, 0.005), `: ${age(0, c)}`);
  verifie('regard z=1', relatif(tempsRegard(1, c), 7.73, 0.01), `: ${tempsRegard(1, c)}`);
}
// Relation de l’auteur : d_lum = d_diam (1 + z)².
for (const z of [0.1, 1, 3, 10]) {
  verifie(`d_lum = d_diam (1+z)², z=${z}`, relatif(distanceLuminosite(z, PLANCK), distanceAngulaire(z, PLANCK) * (1 + z) ** 2, 1e-12));
}
// À petit z, on retrouve la loi de Hubble : d ≈ c z / H0.
verifie('loi de Hubble', relatif(distancePropre(0.001, PLANCK), (299792.458 * 0.001) / PLANCK.H0, 0.001));
// Univers ouvert et fermé : les formules de courbure restent cohérentes avec le cas plat à petit z.
for (const c of [{ H0: 70, Om: 0.3, OL: 0 }, { H0: 70, Om: 1.5, OL: 0 }]) {
  verifie(`courbure Ωm=${c.Om}`, relatif(distancePropre(0.01, c), distanceComobile(0.01, c), 1e-4));
}
// Univers d’Einstein-de Sitter : âge = 2/3 du temps de Hubble.
verifie('Einstein-de Sitter', relatif(age(0, { H0: 70, Om: 1, OL: 0 }), (2 / 3) * (977.792 / 70), 1e-3));
// La recombinaison (z = 1 100) a lieu vers 380 000 ans.
{
  const t = age(1100, PLANCK) * 1e9;
  verifie('recombinaison', t > 3.3e5 && t < 4.3e5, `: ${t.toFixed(0)} ans`);
}

if (echecs) { console.error(`\ndistances.ts : ${echecs} échec(s)`); process.exit(1); }
console.log('distances.ts : tous les tests passent');
