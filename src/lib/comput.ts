/**
 * Calculs du calendrier : jour julien, jour de la semaine, comput ecclésiastique.
 * Formules de Jean Meeus, « Astronomical Algorithms », chap. 7 et 8.
 * Aucune dépendance : le même fichier sert aux pages et aux tests (npm test).
 */
export type Calendrier = 'gregorien' | 'julien';

export const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'] as const;
export const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'] as const;

/** Dernier jour julien de l’ancien style : 4 octobre 1582 ; le lendemain est le 15 octobre 1582. */
export const JJ_REFORME = 2299159.5;

export const estBissextile = (an: number, cal: Calendrier = 'gregorien'): boolean =>
  cal === 'julien' ? an % 4 === 0 : an % 4 === 0 && (an % 100 !== 0 || an % 400 === 0);

export const joursDansLeMois = (an: number, mois: number, cal: Calendrier = 'gregorien'): number =>
  mois === 2 ? (estBissextile(an, cal) ? 29 : 28) : [4, 6, 9, 11].includes(mois) ? 30 : 31;

/** Jour julien (à 0 h) d’une date, dans le calendrier grégorien ou julien. */
export function jourJulien(an: number, mois: number, jour: number, cal: Calendrier = 'gregorien'): number {
  if (mois <= 2) { an -= 1; mois += 12; }
  let b = 0;
  if (cal === 'gregorien') { const a = Math.floor(an / 100); b = 2 - a + Math.floor(a / 4); }
  return Math.floor(365.25 * (an + 4716)) + Math.floor(30.6001 * (mois + 1)) + jour + b - 1524.5;
}

export const jourJulienModifie = (jj: number): number => jj - 2400000.5;

/** Date (calendrier julien avant le 15 octobre 1582, grégorien ensuite) correspondant à un jour julien. */
export function dateDepuisJJ(jj: number): { an: number; mois: number; jour: number; cal: Calendrier } {
  const z = Math.floor(jj + 0.5);
  let a = z;
  if (z >= 2299161) { const alpha = Math.floor((z - 1867216.25) / 36524.25); a = z + 1 + alpha - Math.floor(alpha / 4); }
  const b = a + 1524, c = Math.floor((b - 122.1) / 365.25), d = Math.floor(365.25 * c), e = Math.floor((b - d) / 30.6001);
  const jour = b - d - Math.floor(30.6001 * e);
  const mois = e < 14 ? e - 1 : e - 13;
  return { an: mois > 2 ? c - 4716 : c - 4715, mois, jour, cal: z >= 2299161 ? 'gregorien' : 'julien' };
}

/** 0 = dimanche … 6 = samedi, pour un jour julien. */
export const jourSemaine = (jj: number): number => ((Math.floor(jj + 1.5) % 7) + 7) % 7;

export const cycleSolaire = (an: number): number => ((an + 8) % 28) || 28;
export const indictionRomaine = (an: number): number => ((an + 3) % 15) || 15;
export const nombreOr = (an: number): number => (an % 19) + 1;

/** Lettre(s) dominicale(s) : une lettre, ou deux pour une année bissextile (janvier-février, puis mars-décembre). */
export function lettresDominicales(an: number, cal: Calendrier = 'gregorien'): string[] {
  const premierDimanche = 1 + ((7 - jourSemaine(jourJulien(an, 1, 1, cal))) % 7);
  const l = (i: number) => 'ABCDEFG'[((i % 7) + 7) % 7];
  return estBissextile(an, cal) ? [l(premierDimanche - 1), l(premierDimanche - 2)] : [l(premierDimanche - 1)];
}

/** Paramètre h de l’algorithme grégorien (le jour de la pleine lune pascale est le 21 mars + h, avec deux exceptions). */
function parametreH(an: number): number {
  const a = an % 19, b = Math.floor(an / 100), d = Math.floor(b / 4), f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  return (19 * a + b - d - g + 15) % 30;
}

/** Épacte grégorienne : âge de la Lune ecclésiastique au 1er janvier (0 s’écrit aussi « * »). */
export const epacte = (an: number): number => (((23 - parametreH(an)) % 30) + 30) % 30;

const depuis21mars = (n: number) => (n + 21 <= 31 ? { mois: 3, jour: n + 21 } : { mois: 4, jour: n + 21 - 31 });

/** Pleine lune pascale (ecclésiastique), pour une année grégorienne. */
export function pleineLunePascale(an: number): { mois: number; jour: number } {
  let h = parametreH(an);
  if (h === 29) h = 28;
  else if (h === 28 && an % 19 > 10) h = 27;
  return depuis21mars(h);
}

/** Dimanche de Pâques, pour une année grégorienne (à partir de 1583). */
export function paques(an: number): { mois: number; jour: number } {
  const pl = pleineLunePascale(an);
  const jj = jourJulien(an, pl.mois, pl.jour);
  const suivant = jj + (7 - jourSemaine(jj)); // le dimanche strictement après la pleine lune
  const d = dateDepuisJJ(suivant);
  return { mois: d.mois, jour: d.jour };
}

/** Fêtes mobiles, comptées à partir de Pâques. */
export function fetesMobiles(an: number) {
  const p = paques(an), jj = jourJulien(an, p.mois, p.jour);
  const f = (dec: number) => { const d = dateDepuisJJ(jj + dec); return { mois: d.mois, jour: d.jour }; };
  return { cendres: f(-46), paques: p, ascension: f(39), pentecote: f(49) };
}

export const formaterDate = (d: { mois: number; jour: number; an?: number }): string =>
  `${d.jour === 1 ? '1er' : d.jour} ${MOIS[d.mois - 1]}${d.an !== undefined ? ' ' + d.an : ''}`;

export function donneesAnnee(an: number) {
  return {
    bissextile: estBissextile(an),
    lettres: lettresDominicales(an),
    nombreOr: nombreOr(an),
    cycleSolaire: cycleSolaire(an),
    indiction: indictionRomaine(an),
    epacte: epacte(an),
    pleineLune: pleineLunePascale(an),
    ...fetesMobiles(an),
  };
}
