const C = 299792458, AL = 9.4607e15;
const f = (n: number, max = 0) => n.toLocaleString('fr-FR', { maximumFractionDigits: max });

/** Temps que met la lumière pour parcourir une distance (en mètres), formulé pour la lecture. */
export function tempsLumiere(d: number): string {
  const s = d / C;
  if (s < 60) return f(s, 1) + ' s-lumière';
  if (s < 3600) return f(Math.round(s / 60)) + ' min-lumière';
  if (s < 86400 * 2) return f(s / 3600, 1) + ' h-lumière';
  const a = d / AL;
  if (a < 1) return f(Math.round(s / 86400)) + ' jours-lumière';
  if (a < 1e3) return f(a, 1) + ' années-lumière';
  if (a < 1e6) return f(Math.round(a / 1e3)) + ' milliers d’années-lumière';
  if (a < 1e9) return f(a / 1e6, 1) + ' millions d’années-lumière';
  return f(Math.round(a / 1e9)) + ' milliards d’années-lumière';
}
