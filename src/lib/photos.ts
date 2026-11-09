import { getImage } from 'astro:assets';
import gallery from '../content/gallery.json';

// The gallery is managed in src/content/gallery.json (admin: "Gallery"): order, which photos exist, which are "featured" on the home page.
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

export type Tile = Pic & { srcset: string };
export type Photo = { thumb: Pic; full: Pic; tile: Tile; featured: boolean };

// hero row: 600 px wide, srcset up to 900 px
async function tile(img: ImageMetadata): Promise<Tile> {
  const [s, l] = await Promise.all([webp(img, 600, 80), webp(img, 900, 80)]);
  return { ...s, srcset: `${s.src} ${s.width}w, ${l.src} ${l.width}w` };
}

let cache: Promise<Photo[]> | undefined;
export function loadPortfolio() {
  cache ??= Promise.all(
    gallery.photos.flatMap(({ image, featured }) => {
      const img = files['/public' + image] ?? files['/public' + decodeURI(image)];
      if (!img) {
        console.warn(`[gallery] file not found, skipped: ${image}`);
        return [];
      }
      return [(async () => ({ thumb: await webp(img, 700, 80), full: await webp(img, 1600, 82), tile: await tile(img), featured: !!featured }))()];
    }),
  );
  return cache;
}

// Photos for the hero collage: the ones marked "featured" (max 6); if none are marked, the first 6.
export async function loadFeatured() {
  const all = await loadPortfolio();
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, 6);
}
