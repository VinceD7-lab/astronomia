/**
 * Boucle d’animation commune aux simulateurs : un bouton lecture / pause, une boucle
 * requestAnimationFrame qui ne tourne que lorsque le simulateur est visible à l’écran,
 * et pas de démarrage automatique si l’utilisateur a demandé à réduire les animations.
 */
export function animer(root: HTMLElement, bouton: HTMLButtonElement, etape: (dt: number) => void) {
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let enLecture = false, visible = false, voulu = !reduit, dernier = 0;

  const boucle = (t: number) => {
    if (!enLecture) return;
    if (dernier) etape(Math.min(0.1, (t - dernier) / 1000));
    dernier = t;
    requestAnimationFrame(boucle);
  };
  const lancer = () => {
    if (enLecture || !visible || !voulu) return;
    enLecture = true; dernier = 0; requestAnimationFrame(boucle);
    bouton.textContent = '❚❚ Pause'; bouton.setAttribute('aria-pressed', 'true');
  };
  const arreter = () => {
    enLecture = false;
    bouton.textContent = '▶ Lecture'; bouton.setAttribute('aria-pressed', 'false');
  };
  bouton.addEventListener('click', () => { voulu = !enLecture; if (voulu) lancer(); else arreter(); });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) lancer(); else enLecture = false; }).observe(root);
  return {
    /** Relance l’animation après une remise à zéro, sauf si l’utilisateur l’a mise en pause. */
    relancer: () => lancer(),
  };
}

/** Nombre formaté à la française. */
export const fmt = (x: number, d: number) => x.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
