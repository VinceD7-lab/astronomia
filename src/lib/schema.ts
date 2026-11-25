/**
 * Outils de dessin des schémas SVG en ligne (même principe que les schémas de webastro) :
 * chaque fonction renvoie un fragment SVG dont les couleurs sont des variables du thème,
 * pour que les schémas suivent le thème clair ou sombre.
 */
export type P2 = [number, number];

export interface Trait { couleur?: string; epaisseur?: number; tirets?: string; fleche?: 'fin' | 'debut' | 'deux' }
export interface Etiquette {
  dx?: number; dy?: number; ancre?: 'start' | 'middle' | 'end'; taille?: number; couleur?: string;
  italique?: boolean; gras?: boolean; brut?: boolean;
}

const f = (x: number) => (Math.round(x * 10) / 10).toString();
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Chemin SVG passant par une suite de points. */
export const chemin = (pts: P2[], ferme = false) => pts.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])},${f(p[1])}`).join(' ') + (ferme ? ' Z' : '');

/** Pointe de flèche pleine en b, dans la direction a → b. */
export function pointe(a: P2, b: P2, couleur: string, taille = 10): string {
  const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n, l = taille * 0.42;
  const base: P2 = [b[0] - ux * taille, b[1] - uy * taille];
  return `<path d="${chemin([b, [base[0] - uy * l, base[1] + ux * l], [base[0] + uy * l, base[1] - ux * l]], true)}" fill="${couleur}"/>`;
}

/** Segment, avec flèche éventuelle. */
export function trait(a: P2, b: P2, t: Trait = {}): string {
  const c = t.couleur ?? 'var(--texte)', w = t.epaisseur ?? 1.4;
  let s = `<path d="${chemin([a, b])}" fill="none" stroke="${c}" stroke-width="${w}"${t.tirets ? ` stroke-dasharray="${t.tirets}"` : ''}/>`;
  if (t.fleche === 'fin' || t.fleche === 'deux') s += pointe(a, b, c);
  if (t.fleche === 'debut' || t.fleche === 'deux') s += pointe(b, a, c);
  return s;
}

/** Courbe passant par des points (ellipse, arc…), sans flèche. */
export const courbe = (pts: P2[], t: Trait & { remplir?: string; opacite?: number; ferme?: boolean } = {}) =>
  `<path d="${chemin(pts, t.ferme)}" fill="${t.remplir ?? 'none'}"${t.remplir ? ` fill-opacity="${t.opacite ?? 0.1}"` : ''} stroke="${t.couleur ?? 'var(--texte)'}" stroke-width="${t.epaisseur ?? 1.4}"${t.tirets ? ` stroke-dasharray="${t.tirets}"` : ''}/>`;

/** Texte. */
export function texte(p: P2, s: string, e: Etiquette = {}): string {
  const x = p[0] + (e.dx ?? 0), y = p[1] + (e.dy ?? 0);
  return `<text x="${f(x)}" y="${f(y)}" font-size="${e.taille ?? 15}" fill="${e.couleur ?? 'var(--texte)'}"${e.ancre ? ` text-anchor="${e.ancre}"` : ''}${e.italique ? ' font-style="italic"' : ''}${e.gras ? ' font-weight="600"' : ''}>${e.brut ? s : esc(s)}</text>`;
}

/** Indice (à placer en fin d’étiquette, avec `brut: true`). */
export const ind = (s: string) => `<tspan dy="4" font-size="0.72em">${s}</tspan>`;

/** Point plein. */
export const point = (p: P2, r = 3.5, couleur = 'var(--texte)') => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${r}" fill="${couleur}"/>`;

/** Points d’une ellipse de centre c, demi-axes a et b (axes horizontaux), entre les angles t0 et t1 (radians). */
export function pointsEllipse(c: P2, a: number, b: number, t0 = 0, t1 = 2 * Math.PI, n = 120): P2[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = t0 + ((t1 - t0) * i) / n;
    return [c[0] + a * Math.cos(t), c[1] - b * Math.sin(t)] as P2;
  });
}

/** Arc de cercle marquant un angle de sommet c, du rayon r, entre deux directions (radians, sens direct à l’écran). */
export const arcAngle = (c: P2, r: number, a0: number, a1: number, t: Trait = {}) =>
  courbe(pointsEllipse(c, r, r, a0, a1, 30), { epaisseur: 1.2, ...t });
