/** Interface commune : thème, sommaire, recherche (index du cours + texte des chapitres migrés via Pagefind). */
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
const racine = document.documentElement;

/* ---------- thème ---------- */
$('theme')?.addEventListener('click', () => {
  const sombre = racine.dataset.theme ? racine.dataset.theme === 'dark' : !matchMedia('(prefers-color-scheme: light)').matches;
  racine.dataset.theme = sombre ? 'light' : 'dark';
  try { localStorage.setItem('astronomia-theme', racine.dataset.theme); } catch { /* stockage indisponible */ }
  document.dispatchEvent(new Event('themechange'));
});
matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => document.dispatchEvent(new Event('themechange')));

/* ---------- fenêtres ---------- */
const som = $<HTMLDialogElement>('sommaire'), rech = $<HTMLDialogElement>('recherche');
document.querySelectorAll<HTMLElement>('[data-fermer]').forEach((b) => b.addEventListener('click', () => b.closest('dialog')?.close()));
[som, rech].forEach((d) => d?.addEventListener('click', (e) => { if (e.target === d || (e.target as HTMLElement).closest('a')) d.close(); }));
$('ouvrirSommaire')?.addEventListener('click', () => som?.showModal());

/* ---------- recherche ---------- */
interface Entree { t: string; d: string; u: string }
const INDEX: Entree[] = JSON.parse($('index-recherche')?.textContent || '[]');
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const surligner = (s: string, q: string) => { const i = norm(s).indexOf(q); return i < 0 ? esc(s) : esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + q.length)) + '</mark>' + esc(s.slice(i + q.length)); };

let pagefind: any = null, pagefindEssaye = false;
async function chargerPagefind() {
  if (pagefindEssaye) return; pagefindEssaye = true;
  try { pagefind = await import(/* @vite-ignore */ base + 'pagefind/pagefind.js'); await pagefind.init?.(); } catch { pagefind = null; }
}
let jeton = 0;
async function chercher() {
  const saisie = ($<HTMLInputElement>('q')?.value ?? '').trim(), q = norm(saisie), liste = $('resultats')!, ici = ++jeton;
  const l = q ? INDEX.filter((x) => norm(x.t + ' ' + x.d).includes(q)) : INDEX.slice(0, 8);
  let html = l.slice(0, 30).map((x) => `<li><a href="${esc(x.u)}">${q ? surligner(x.t, q) : esc(x.t)}<small>${q ? surligner(x.d, q) : esc(x.d)}</small></a></li>`).join('');
  if (q.length > 2 && pagefind) {
    const r = await pagefind.search(saisie);
    if (ici !== jeton) return;
    const textes = await Promise.all(r.results.slice(0, 5).map((x: any) => x.data()));
    if (textes.length) html += '<li class="separe">Dans le texte des chapitres de cette version</li>' + textes.map((t: any) => `<li><a href="${esc(t.url)}">${esc(t.meta?.title ?? t.url)}<small>${t.excerpt}</small></a></li>`).join('');
  }
  liste.innerHTML = html || `<li class="vide">Rien ne correspond à « ${esc(saisie)} ». Essayez un autre mot, ou consultez le <a href="https://astronomia.fr/7eme_partie/lexique.php">lexique</a>.</li>`;
}
async function ouvrirRecherche() {
  rech?.showModal(); const q = $<HTMLInputElement>('q')!; q.value = ''; q.focus(); chercher();
  await chargerPagefind(); if (q.value) chercher();
}
$('ouvrirRecherche')?.addEventListener('click', ouvrirRecherche);
$('q')?.addEventListener('input', chercher);
document.addEventListener('keydown', (e) => {
  const tag = document.activeElement?.tagName ?? '';
  if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(tag) && !document.querySelector('dialog[open]')) { e.preventDefault(); ouvrirRecherche(); }
});
