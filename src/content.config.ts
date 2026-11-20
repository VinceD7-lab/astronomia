import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Un chapitre = un fichier .mdx dans src/content/chapitres/partie-N/<nom>.mdx
 * L’adresse en découle : partie-1/calendrier.mdx → /partie-1/calendrier/
 * `chemin` est le chemin du chapitre sur astronomia.fr : il sert à retrouver
 * le chapitre précédent et le suivant, et à relier chaque section à sa page d’origine.
 */
const chapitres = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/chapitres' }),
  schema: z.object({
    title: z.string(),
    partie: z.number().int().min(1).max(7),
    chemin: z.string(),
    resume: z.string(),
    maj: z.string().optional(),
    epigraphe: z.string().optional(),
  }),
});

export const collections = { chapitres };
