/**
 * Modèles du monde antiques : sphères de Pythagore et de Ptolémée, épicycles et équant.
 * Calculs sans dépendance, partagés par les simulateurs du chapitre « Cosmogonie antique »
 * et testés par `npm test`.
 */

const TOUR = 2 * Math.PI;

/** Jours écoulés depuis J2000 (1er janvier 2000 à 12 h TU). */
export function joursDepuisJ2000(date: Date): number {
  return (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86_400_000;
}

/* ------------------------------------------------------------------ */
/* Sphères géocentriques                                               */
/* ------------------------------------------------------------------ */

export interface Sphere {
  nom: string;
  /** Période du mouvement moyen sur la sphère, en jours. */
  periode: number;
  /** Longitude moyenne à J2000, en degrés. */
  l0: number;
  /** Pour Mercure et Vénus : élongation maximale (°) et période synodique (j). */
  elongation?: { max: number; synodique: number; phase0: number };
}

/**
 * Les sept « astres errants », dans l’ordre des sphères de Ptolémée (de la Terre vers les fixes).
 * Longitudes moyennes à J2000 d’après Meeus ; Mercure et Vénus suivent le Soleil moyen,
 * comme dans le modèle de Ptolémée, en oscillant de part et d’autre (leur épicycle).
 */
export const SPHERES: Sphere[] = [
  { nom: 'Lune', periode: 27.321661, l0: 218.316 },
  { nom: 'Mercure', periode: 365.256363, l0: 280.466, elongation: { max: 22, synodique: 115.8775, phase0: 1.2 } },
  { nom: 'Vénus', periode: 365.256363, l0: 280.466, elongation: { max: 46, synodique: 583.9214, phase0: 5.9 } },
  { nom: 'Soleil', periode: 365.256363, l0: 280.466 },
  { nom: 'Mars', periode: 686.98, l0: 355.433 },
  { nom: 'Jupiter', periode: 4332.589, l0: 34.351 },
  { nom: 'Saturne', periode: 10759.22, l0: 50.077 },
];

/** Longitude (°, entre 0 et 360) d’un astre sur sa sphère, `j` jours après J2000. */
export function longitudeSphere(s: Sphere, j: number): number {
  let l = s.l0 + (360 * j) / s.periode;
  if (s.elongation) {
    const { max, synodique, phase0 } = s.elongation;
    l += max * Math.sin(phase0 + (TOUR * j) / synodique);
  }
  return ((l % 360) + 360) % 360;
}

/* ------------------------------------------------------------------ */
/* Épicycle, déférent et équant                                        */
/* ------------------------------------------------------------------ */

export interface Ptolemee {
  /** Rayon de l’épicycle, en rayons du déférent. */
  r: number;
  /** Rapport v2 / v1 : la planète fait k tours sur l’épicycle pendant un tour du déférent. */
  k: number;
  /** Excentricité : distance Terre–centre du déférent (= centre–équant), en rayons du déférent. */
  e: number;
}

export interface Point { x: number; y: number }

/**
 * Centre de l’épicycle quand la droite issue de l’équant fait l’angle `a` (radians).
 * Le déférent est le cercle de rayon 1 centré à l’origine ; l’équant est en (−e, 0), la Terre en (+e, 0).
 * C’est l’angle vu depuis l’équant qui croît uniformément (pour e = 0, Terre, centre et équant sont confondus).
 */
export function centreEpicycle(a: number, e: number): Point {
  const ux = Math.cos(a), uy = Math.sin(a);
  // point de la demi-droite (−e, 0) + s·u situé sur le cercle unité
  const b = -e * ux;
  const s = -b + Math.sqrt(b * b - e * e + 1);
  return { x: -e + s * ux, y: s * uy };
}

/** Position de la planète, pour l’angle `a` (radians) du centre de l’épicycle vu depuis l’équant. */
export function planete(a: number, p: Ptolemee): Point {
  const c = centreEpicycle(a, p.e);
  return { x: c.x + p.r * Math.cos(p.k * a), y: c.y + p.r * Math.sin(p.k * a) };
}

/** Position de la Terre. */
export const terre = (p: Ptolemee): Point => ({ x: p.e, y: 0 });

/** Longitude géocentrique (radians, entre −π et π) de la planète. */
export function longitude(a: number, p: Ptolemee): number {
  const P = planete(a, p), T = terre(p);
  return Math.atan2(P.y - T.y, P.x - T.x);
}

/** Écart d’angle ramené entre −π et π. */
export const ecart = (d: number) => d - TOUR * Math.round(d / TOUR);

/**
 * Nombre de rétrogradations pendant un tour complet du déférent (une révolution synodique),
 * compté sur le mouvement réel vu depuis la Terre. Pour un rapport k entier, le mouvement
 * se répète à chaque tour : le comptage est exact.
 */
export function retrogradations(p: Ptolemee, pas = 3600): number {
  const d: number[] = [];
  let prec = longitude(0, p);
  for (let i = 1; i <= pas; i++) {
    const l = longitude((TOUR * i) / pas, p);
    d.push(ecart(l - prec));
    prec = l;
  }
  let n = 0;
  for (let i = 0; i < d.length; i++) {
    const avant = d[(i - 1 + d.length) % d.length];
    if (avant > 0 && d[i] <= 0) n++;
  }
  return n;
}
