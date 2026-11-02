import { getImage } from 'astro:assets';

// Every image dropped into public/images/portfolio/ shows up on the site, sorted by file name.
// (separate patterns: a brace pattern chokes on file names like "photo (1).png"; glob arguments must be literals)
const files = import.meta.glob<ImageMetadata>(
  ['/public/images/portfolio/*.png', '/public/images/portfolio/*.jpg', '/public/images/portfolio/*.jpeg', '/public/images/portfolio/*.webp'],
  { eager: true, import: 'default' },
);
const portraitFiles = import.meta.glob<ImageMetadata>(
  ['/public/images/victoria.png', '/public/images/victoria.jpg', '/public/images/victoria.jpeg', '/public/images/victoria.webp'],
  { eager: true, import: 'default' },
);

export type Pic = { src: string; width: number; height: number };

// never ask for more pixels than the original has
async function webp(img: ImageMetadata, width: number, quality: number): Promise<Pic> {
  const out = await getImage({ src: img, width: Math.min(width, img.width), format: 'webp', quality });
  return { src: out.src, width: out.options.width as number, height: out.options.height as number };
}

let cache: Promise<{ thumb: Pic; full: Pic }[]> | undefined;
export function loadPortfolio() {
  cache ??= Promise.all(
    Object.entries(files)
      .sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))
      .map(async ([, img]) => ({ thumb: await webp(img, 700, 80), full: await webp(img, 1600, 82) })),
  );
  return cache;
}

export async function loadPortrait(): Promise<{ x1: Pic; x2: Pic } | null> {
  const img = Object.values(portraitFiles)[0];
  if (!img) return null;
  return { x1: await webp(img, 440, 82), x2: await webp(img, 880, 82) };
}
