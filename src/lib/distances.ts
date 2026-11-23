/**
 * Mesure des distances : méthode d’Aristarque, parallaxe, Céphéides et distances cosmologiques.
 * Calculs sans dépendance, partagés par les simulateurs du chapitre « Les distances »
 * et testés par `npm test`.
 */

const DEG = Math.PI / 180;

/** Unités. */
export const UA_KM = 149_597_870.7;
export const PC_UA = 206_264.806;          // un parsec, en unités astronomiques
export const PC_AL = 3.261_563_8;          // un parsec, en années-lumière
export const PC_KM = PC_UA * UA_KM;
export const C_KMS = 299_792.458;
export const LUNAISON_J = 29.530_589;

/* ------------------------------------------------------------------ */
/* Aristarque                                                          */
/* ------------------------------------------------------------------ */

/**
 * Au premier quartier, l’angle Terre-Lune-Soleil est droit. Si l’angle LTH (entre la Lune et la
 * perpendiculaire à la direction du Soleil) vaut `theta` degrés, la distance du Soleil vaut
 * ST = LT / sin(theta) : renvoie le rapport ST / LT.
 */
export const rapportSoleilLune = (thetaDeg: number) => 1 / Math.sin(thetaDeg * DEG);

/**
 * Avance du premier quartier sur le milieu entre nouvelle et pleine Lune, en heures,
 * pour un angle `theta` (degrés). L’écart entre les deux intervalles NL → PQ et PQ → PL vaut le double.
 */
export const avancePremierQuartier = (thetaDeg: number) => (thetaDeg / 360) * LUNAISON_J * 24;

/* ------------------------------------------------------------------ */
/* Parallaxe                                                           */
/* ------------------------------------------------------------------ */

/** Parallaxe (secondes d’arc) → distance (parsecs), et l’inverse : d = 1 / p. */
export const distanceParallaxe = (pArcsec: number) => 1 / pArcsec;
export const parallaxe = (dPc: number) => 1 / dPc;

/* ------------------------------------------------------------------ */
/* Magnitudes et Céphéides                                             */
/* ------------------------------------------------------------------ */

/** Module de distance : m − M = 5 log₁₀ d − 5, d en parsecs. */
export const moduleDistance = (dPc: number) => 5 * Math.log10(dPc) - 5;
/** Distance (parsecs) tirée de la magnitude apparente m et de la magnitude absolue M. */
export const distanceModule = (m: number, M: number) => 10 ** ((m - M + 5) / 5);

/**
 * Relation période-luminosité des Céphéides classiques (loi de Leavitt), en bande V :
 * M_V = −2,43 (log₁₀ P − 1) − 4,05, P en jours (Benedict et al. 2007, étalonnée par les parallaxes).
 */
export const magnitudeCepheide = (periodeJ: number) => -2.43 * (Math.log10(periodeJ) - 1) - 4.05;

/* ------------------------------------------------------------------ */
/* Distances cosmologiques (modèle de Friedmann-Lemaître)              */
/* ------------------------------------------------------------------ */

export interface Cosmo {
  /** Constante de Hubble, km/s/Mpc. */
  H0: number;
  /** Densité de matière. */
  Om: number;
  /** Constante cosmologique. */
  OL: number;
  /** Densité de rayonnement (photons et neutrinos), négligeable sauf vers le Big Bang. */
  Or?: number;
}

/** Paramètres proches des mesures du satellite Planck (2018). */
export const PLANCK: Cosmo = { H0: 67.7, Om: 0.31, OL: 0.69, Or: 9.1e-5 };

const courbure = (c: Cosmo) => 1 - c.Om - c.OL - (c.Or ?? 0);

/** Intégrale de Simpson de f entre a et b, n pas (pair). */
function simpson(f: (x: number) => number, a: number, b: number, n = 400): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
}

/** Facteur d’échelle a = 1 / (1 + z). */
export const facteurEchelle = (z: number) => 1 / (1 + z);

/** a² E(a) au carré divisé par a⁰ : forme régulière utilisée dans les intégrales en a. */
const a2E = (a: number, c: Cosmo) => Math.sqrt((c.Or ?? 0) + c.Om * a + courbure(c) * a * a + c.OL * a ** 4);

/** Rayon de Hubble c / H0, en Mpc, et temps de Hubble 1 / H0, en milliards d’années. */
export const rayonHubble = (c: Cosmo) => C_KMS / c.H0;
export const tempsHubble = (c: Cosmo) => 977.792 / c.H0;

/** Distance comobile radiale (Mpc) d’un objet au décalage z. */
export function distanceComobile(z: number, c: Cosmo): number {
  const a = facteurEchelle(z);
  return rayonHubble(c) * simpson((x) => 1 / a2E(x, c), a, 1);
}

/**
 * Distance propre aujourd’hui (Mpc), notée d_φ dans le texte : c’est la distance comobile transverse,
 * égale à la distance comobile si l’Univers est plat.
 */
export function distancePropre(z: number, c: Cosmo): number {
  const dc = distanceComobile(z, c), ok = courbure(c), dh = rayonHubble(c);
  if (Math.abs(ok) < 1e-8) return dc;
  const r = Math.sqrt(Math.abs(ok));
  return ok > 0 ? (dh / r) * Math.sinh((r * dc) / dh) : (dh / r) * Math.sin((r * dc) / dh);
}

/** Distance de luminosité d_lum = d_φ (1 + z), en Mpc. */
export const distanceLuminosite = (z: number, c: Cosmo) => distancePropre(z, c) * (1 + z);
/** Distance de diamètre angulaire d_diam = d_φ / (1 + z), en Mpc. */
export const distanceAngulaire = (z: number, c: Cosmo) => distancePropre(z, c) / (1 + z);

/** Âge de l’Univers (milliards d’années) au moment où la lumière observée au décalage z a été émise. */
export function age(z: number, c: Cosmo): number {
  const a = facteurEchelle(z);
  // dt = da / (a H) = a da / (H0 · a² E) ; avec a = u², l’intégrande 2u³ / a²E(u²) reste régulier en 0
  return tempsHubble(c) * simpson((u) => (u === 0 ? 0 : (2 * u ** 3) / a2E(u * u, c)), 0, Math.sqrt(a), 800);
}

/** Temps de parcours de la lumière (milliards d’années). */
export const tempsRegard = (z: number, c: Cosmo) => age(0, c) - age(z, c);

/** Conversions. */
export const MPC_GAL = PC_AL / 1000;                  // 1 Mpc en milliards d’années-lumière
