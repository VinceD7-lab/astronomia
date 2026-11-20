/** Préfixe une adresse interne par le sous-dossier du site (réglage `base` d’astro.config.mjs). */
export const url = (chemin: string): string => import.meta.env.BASE_URL.replace(/\/$/, '') + chemin;
