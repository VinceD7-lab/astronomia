import { url } from '../lib/url';
import partiesJson from './parties.json';
import animationsJson from './animations.json';
import outilsJson from './outils.json';
import reperesJson from './reperes.json';
import bandesJson from './bandes.json';
import astresJson from './astres.json';

/** Site actuel : tout ce qui n’est pas encore migré y renvoie. */
export const ORIGINE = 'https://astronomia.fr/';

export interface Chapitre { titre: string; chemin: string; sous?: string }
export interface Partie { n: string; id: string; titre: string; portee: string; resume: string; chapitres: Chapitre[] }
export interface Animation { partie: string; titre: string; chemin: string; motif: string }
export const parties: Partie[] = partiesJson;
export const animations: Animation[] = animationsJson;
export const outils: { titre: string; chemin: string }[] = outilsJson;
export const reperes: { nom: string; metres: number; texte: string }[] = reperesJson;
export const bandes: { libelle: string; cible: string; debut: number; fin: number; rang: number }[] = bandesJson;
export const astres: { nom: string; g: number }[] = astresJson;

/**
 * Pages déjà migrées : chemin sur astronomia.fr → adresse de la nouvelle page.
 * Pour migrer un chapitre, ajoutez une ligne ici (et la redirection dans astro.config.mjs).
 */
export const locales: Record<string, string> = {
  '1ere_partie/calendrier/calendrier.php': '/partie-1/calendrier/',
  '1ere_partie/calendrier/calculCalendrier.php': '/partie-1/calendrier/#almanach',
  '1ere_partie/cosmoAntique.php': '/partie-1/cosmogonie-antique/',
  '1ere_partie/distances.php': '/partie-1/distances/',
  '1ere_partie/generalites.php': '/partie-1/generalites/',
  'seminaires/annee1314/mecaniqueCeleste.php': '/partie-1/mecanique/',
  '1ere_partie/instruments.php': '/partie-1/instruments/',
  '1ere_partie/tailleMiroir.php': '/partie-1/taille-miroir/',
  '1ere_partie/lumiere.php': '/partie-1/lumiere/',
  '1ere_partie/radioastronomie.php': '/partie-1/radiotelescopes/',
  '1ere_partie/astroMillimetrique.php': '/partie-1/telescopes-millimetriques/',
  '1ere_partie/sphereArmillaire/sphereArmillaire.php': '/partie-1/sphere-armillaire/',
  '1ere_partie/lumiere_java/interferences.html': '/partie-1/lumiere/#animationOndes',
  '1ere_partie/cosmoAntique_java/epicycles_java/ptolemee.html': '/partie-1/cosmogonie-antique/#almageste',
  '1ere_partie/cosmoAntique_java/equant_java/equant.html': '/partie-1/cosmogonie-antique/#equants',
};

/** Adresse d’une page du cours : la nouvelle page si elle existe, sinon la page d’origine. */
export function lien(chemin: string): { href: string; local: boolean } {
  const [sansAncre, ancre] = chemin.split('#');
  const cible = locales[chemin] ?? (locales[sansAncre] ? locales[sansAncre] + (ancre ? '#' + ancre : '') : undefined);
  return cible ? { href: url(cible), local: true } : { href: ORIGINE + chemin, local: false };
}

/** Précédent et suivant d’un chapitre dans l’ordre du livre. */
export function voisins(chemin: string) {
  const tous = parties.flatMap((p) => p.chapitres.map((c) => ({ ...c, partie: p })));
  const i = tous.findIndex((c) => c.chemin === chemin);
  return { precedent: i > 0 ? tous[i - 1] : undefined, suivant: i >= 0 && i < tous.length - 1 ? tous[i + 1] : undefined, courant: tous[i] };
}

export const annexes = [
  { chemin: '7eme_partie/lexique.php', titre: 'Lexique', texte: '1643 termes d’astronomie définis' },
  { chemin: '7eme_partie/fiches.php', titre: 'Fiches de données', texte: 'Les caractéristiques des astres en tableaux' },
  { chemin: '7eme_partie/formulaire.php', titre: 'Formulaire', texte: 'Les formules utilisées dans le cours' },
  { chemin: '7eme_partie/maths.php', titre: 'Rappels de maths', texte: 'Puissances, logarithmes, angles…' },
  { chemin: '7eme_partie/multiplicateurs.php', titre: 'Multiplicateurs', texte: 'Des préfixes kilo et giga jusqu’aux plus extrêmes' },
  { chemin: '7eme_partie/alphabetGrec.php', titre: 'Alphabet grec', texte: 'Pour lire les noms d’étoiles' },
  { chemin: '7eme_partie/fiches/mendeleev/mendeleev.php', titre: 'Tableau périodique', texte: 'Les éléments chimiques' },
  { chemin: '7eme_partie/consultation.php', titre: 'Bibliographie', texte: 'Pour aller plus loin' },
];
