/** Ciel étoilé de l’ouverture : dessiné sur un canvas, animé seulement quand il est visible. */
const cv = document.getElementById('ciel') as HTMLCanvasElement | null;
if (cv) {
  const racine = document.documentElement;
  const mouvement = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let etoiles: number[][] = [], anim = 0;
  const couleur = (n: string) => getComputedStyle(racine).getPropertyValue(n).trim();
  const dessiner = (t = 0) => {
    const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(r.width * dpr)) {
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      etoiles = Array.from({ length: Math.round((r.width * r.height) / 2600) }, () => [Math.random(), Math.random(), Math.random() * 1.2 + 0.3, Math.random() * 6.28, Math.random() < 0.08 ? 1 : 0]);
    }
    const g = cv.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, r.width, r.height);
    const clair = getComputedStyle(racine).colorScheme === 'light', base = couleur('--texte'), chaud = couleur('--sodium');
    for (const e of etoiles) {
      const sc = mouvement && t ? 0.55 + 0.45 * Math.sin(t / 900 + e[3]) : 0.8;
      g.globalAlpha = (clair ? 0.25 : 0.75) * sc * (e[0] > 0.55 ? 1 : 0.45);
      g.fillStyle = e[4] ? chaud : base;
      g.beginPath(); g.arc(e[0] * r.width, e[1] * r.height, e[2], 0, 7); g.fill();
    }
    g.globalAlpha = 1;
  };
  const boucle = (t: number) => { dessiner(t); anim = requestAnimationFrame(boucle); };
  dessiner();
  if (mouvement && 'IntersectionObserver' in window) {
    new IntersectionObserver((en) => {
      if (en[0].isIntersecting) { if (!anim) anim = requestAnimationFrame(boucle); } else { cancelAnimationFrame(anim); anim = 0; }
    }).observe(cv);
  }
  window.addEventListener('resize', () => { cv.width = 0; dessiner(); });
  document.addEventListener('themechange', () => dessiner());
}
