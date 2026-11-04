import { getImage } from 'astro:assets';
import gallery from '../content/gallery.json';

// The gallery is managed in src/content/gallery.json (admin: "Gallery"): order, which photos exist, which ones go on the home page ("featured").
// Files live in public/images/portfolio/.
// (separate patterns: a brace pattern chokes on file names like "photo (1).png"; glob arguments must be literals)
const files = import.meta.glob<ImageMetadata>(
  ['/public/images/portfolio/*.png', '/public/images/portfolio/*.jpg', '/public/images/portfolio/*.jpeg', '/public/images/portfolio/*.webp'],
  { eager: true, import: 'default' },
);
export type Pic = { src: string; width: number; height: number };

// never ask for more pixels than the original has
async function webp(img: ImageMetadata, width: number, quality: number): Promise<Pic> {
  const out = await getImage({ src: img, width: Math.min(width, img.width), format: 'webp', quality });
  return { src: out.src, width: out.options.width as number, height: out.options.height as number };
}

export type Photo = { image: string; thumb: Pic; full: Pic };

let cache: Promise<Photo[]> | undefined;
export function loadPortfolio() {
  cache ??= Promise.all(
    gallery.photos.flatMap(({ image }) => {
      const img = files['/public' + image] ?? files['/public' + decodeURI(image)];
      if (!img) {
        console.warn(`[gallery] file not found, skipped: ${image}`);
        return [];
      }
      return [(async () => ({ image, thumb: await webp(img, 700, 80), full: await webp(img, 1600, 82) }))()];
    }),
  );
  return cache;
}

// Photos for the hero collage: the ones chosen in "featured" (max 6, in that order); if none are chosen, the first 6.
export async function loadFeatured() {
  const all = await loadPortfolio();
  const chosen = gallery.featured.flatMap((image) => all.find((p) => p.image === image) ?? []);
  return (chosen.length ? chosen : all).slice(0, 6);
}
