/** Vignettes dessinées des animations (un motif par animation, aux couleurs du thème). */
const couleur = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

export function dessinerVignettes(): void {
  const c1 = couleur('--oiii'), c2 = couleur('--sodium'), c3 = couleur('--halpha'), cd = couleur('--doux'), fond = couleur('--voute-2');
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-motif]').forEach((cv) => {
    const g = cv.getContext('2d')!, w = 84, m = cv.dataset.motif, k = +(cv.dataset.graine ?? 0);
    g.clearRect(0, 0, w, w); g.lineWidth = 2; g.lineCap = 'round';
    const alea = (j: number) => { const x = Math.sin(k * 97.1 + j * 13.7) * 43758.5; return x - Math.floor(x); };
    if (m === 'orbite') { g.strokeStyle = c1; g.beginPath(); g.ellipse(42, 42, 28, 17, -0.4 + alea(1) * 0.8, 0, 7); g.stroke(); g.fillStyle = c2; g.beginPath(); g.arc(50, 40, 5, 0, 7); g.fill(); g.fillStyle = c3; g.beginPath(); g.arc(17, 50, 3, 0, 7); g.fill(); }
    else if (m === 'boucle') { g.strokeStyle = c1; g.beginPath(); for (let i = 0; i <= 120; i++) { const t = (i / 120) * Math.PI * 2, x = 42 + 22 * Math.cos(t) + 9 * Math.cos(3 * t), y = 42 + 22 * Math.sin(t) + 9 * Math.sin(3 * t); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.fillStyle = c2; g.beginPath(); g.arc(42, 42, 4, 0, 7); g.fill(); }
    else if (m === 'onde') { for (let r = 0; r < 3; r++) { g.strokeStyle = [c1, c2, c3][r]; g.beginPath(); for (let i = 0; i <= 60; i++) { const xx = 12 + i, yy = 42 + Math.sin(i / (5 + r * 2) + alea(r) * 6) * (8 + r * 3) * (r === 1 ? 0.7 : 1); i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); } }
    else if (m === 'horizon') { g.fillStyle = c2; g.beginPath(); g.arc(42, 52, 13, Math.PI, 0); g.fill(); g.strokeStyle = c1; g.beginPath(); g.moveTo(10, 52); g.lineTo(74, 52); g.stroke(); g.strokeStyle = cd; g.beginPath(); g.moveTo(16, 62); g.lineTo(68, 62); g.stroke(); }
    else if (m === 'disque') { const gr = g.createRadialGradient(36, 36, 4, 42, 42, 28); gr.addColorStop(0, c2); gr.addColorStop(1, c3); g.fillStyle = gr; g.globalAlpha = 0.85; g.beginPath(); g.arc(42, 42, 26, 0, 7); g.fill(); g.globalAlpha = 1; g.fillStyle = fond; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(30 + alea(i) * 24, 30 + alea(i + 9) * 24, 2 + alea(i + 3) * 4, 0, 7); g.fill(); } }
    else if (m === 'courbe') { g.strokeStyle = cd; g.beginPath(); g.moveTo(14, 18); g.lineTo(14, 68); g.lineTo(72, 68); g.stroke(); g.strokeStyle = c1; g.beginPath(); for (let i = 0; i <= 56; i++) { const cx = 14 + i, cy = k % 2 ? 66 - 50 * Math.exp(-i / 16) : 30 + 12 * Math.sin(i / 6) - i * 0.15; i ? g.lineTo(cx, cy) : g.moveTo(cx, cy); } g.stroke(); }
    else if (m === 'points') { for (let i = 0; i < 22; i++) { g.fillStyle = [c1, c2, c3, cd][i % 4]; g.beginPath(); g.arc(12 + alea(i) * 60, 12 + alea(i + 40) * 60, 1 + alea(i + 80) * 2.4, 0, 7); g.fill(); } }
    else if (m === 'etoile') { const gr = g.createRadialGradient(42, 42, 0, 42, 42, 28); gr.addColorStop(0, c2); gr.addColorStop(0.35, c3); gr.addColorStop(1, 'transparent'); g.fillStyle = gr; g.beginPath(); g.arc(42, 42, 28, 0, 7); g.fill(); g.strokeStyle = c2; g.beginPath(); g.moveTo(42, 10); g.lineTo(42, 74); g.moveTo(10, 42); g.lineTo(74, 42); g.globalAlpha = 0.5; g.stroke(); g.globalAlpha = 1; }
    else if (m === 'spirale') { g.fillStyle = c1; for (let i = 0; i < 220; i++) { const a2 = (i / 220) * Math.PI * 4, rr = 2 + (i / 220) * 27, bras = i % 2 ? Math.PI : 0; g.globalAlpha = 0.25 + alea(i) * 0.6; g.beginPath(); g.arc(42 + rr * Math.cos(a2 + bras) + (alea(i) - 0.5) * 3, 42 + rr * Math.sin(a2 + bras) * 0.7 + (alea(i + 5) - 0.5) * 3, 1.1, 0, 7); g.fill(); } g.globalAlpha = 1; g.fillStyle = c2; g.beginPath(); g.arc(42, 42, 3.5, 0, 7); g.fill(); }
  });
}
