/**
 * Mécanique du mouvement : tir horizontal (mouvement parabolique), ellipse et orbite képlérienne.
 * Calculs sans dépendance, partagés par les simulateurs des chapitres « Généralités » et
 * « Un peu de mécanique », et testés par `npm test`.
 */

/* ------------------------------------------------------------------ */
/* Mouvement parabolique                                               */
/* ------------------------------------------------------------------ */

/** Position d’un corps lancé horizontalement à la vitesse v, dans un champ de pesanteur g constant. */
export const tirHorizontal = (v: number, g: number, t: number) => ({ x: v * t, y: (g * t * t) / 2 });

/* ------------------------------------------------------------------ */
/* Ellipse                                                             */
/* ------------------------------------------------------------------ */

/** Demi-petit axe et distance centre-foyer d’une ellipse de demi-grand axe a et d’excentricité e. */
export const ellipse = (a: number, e: number) => ({ a, b: a * Math.sqrt(1 - e * e), c: a * e });

/** Point de l’ellipse (centrée à l’origine) pour l’angle paramétrique t. */
export function pointEllipse(a: number, e: number, t: number) {
  const { b } = ellipse(a, e);
  return { x: a * Math.cos(t), y: b * Math.sin(t) };
}

/* ------------------------------------------------------------------ */
/* Mouvement képlérien                                                 */
/* ------------------------------------------------------------------ */

/** Résout l’équation de Kepler M = E − e sin E par la méthode de Newton (angles en radians). */
export function anomalieExcentrique(M: number, e: number): number {
  let E = e < 0.8 ? M : Math.PI;
  for (let i = 0; i < 50; i++) {
    const d = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-13) break;
  }
  return E;
}

/**
 * État de la planète sur son orbite, l’étoile étant au foyer (origine), le périhélie sur l’axe des x
 * positifs. `M` est l’anomalie moyenne (proportionnelle au temps). Distances en demi-grand axe,
 * vitesse en vitesse circulaire à la distance a (vis-viva : v² = 2/r − 1/a).
 */
export function etatKepler(M: number, e: number) {
  const E = anomalieExcentrique(M, e);
  const x = Math.cos(E) - e, y = Math.sqrt(1 - e * e) * Math.sin(E);
  const r = 1 - e * Math.cos(E);
  return { E, x, y, r, v: Math.sqrt(2 / r - 1), nu: Math.atan2(y, x) };
}
