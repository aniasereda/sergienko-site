import { getImage } from 'astro:assets';

// Before/after pairs come from src/assets/ba/. File names: "<number><a|b>" (a = after, b = before),
// any case, optional space/dash/underscore between, extension jpg/jpeg/png/webp. Drop "18b" + "18a" in the folder and the pair appears at the end.
const files = import.meta.glob<ImageMetadata>('/src/assets/ba/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, import: 'default' });
const NAME = /\/(\d+)[\s_-]*([ab])\.(?:jpe?g|png|webp)$/i;

export type Pic = { src: string; srcset: string; width: number; height: number };
export type Pair = { n: number; before: Pic; after: Pic; beforeFull: { src: string; width: number; height: number }; afterFull: { src: string; width: number; height: number } };

type Slot = { b?: ImageMetadata; a?: ImageMetadata };
const slots = new Map<number, Slot>();
const unmatched: string[] = [];
for (const [path, img] of Object.entries(files)) {
  const m = path.match(NAME);
  if (!m) { unmatched.push(path); continue; }
  const slot = slots.get(Number(m[1])) ?? {};
  slot[m[2].toLowerCase() as 'a' | 'b'] = img;
  slots.set(Number(m[1]), slot);
}

const fit = (img: ImageMetadata, w: number) => Math.min(w, img.width);
async function thumb(img: ImageMetadata): Promise<Pic> {
  const [s, l] = await Promise.all([
    getImage({ src: img, width: fit(img, 600), format: 'webp', quality: 80 }),
    getImage({ src: img, width: fit(img, 1000), format: 'webp', quality: 80 }),
  ]);
  return { src: s.src, srcset: `${s.src} ${s.options.width}w, ${l.src} ${l.options.width}w`, width: s.options.width as number, height: s.options.height as number };
}
async function full(img: ImageMetadata) {
  const o = await getImage({ src: img, width: fit(img, 1600), format: 'webp', quality: 82 });
  return { src: o.src, width: o.options.width as number, height: o.options.height as number };
}

export const incomplete = [...slots].filter(([, s]) => !s.a || !s.b).map(([n]) => n);
if (incomplete.length) console.warn(`[ba] incomplete pairs skipped: ${incomplete.join(', ')}`);
if (unmatched.length) console.warn(`[ba] files with unexpected names skipped: ${unmatched.join(', ')}`);

let cache: Promise<Pair[]> | undefined;
export function loadPairs() {
  cache ??= Promise.all(
    [...slots]
      .filter(([, s]) => s.a && s.b)
      .sort((x, y) => x[0] - y[0])
      .map(async ([n, s]) => ({
        n,
        before: await thumb(s.b!),
        after: await thumb(s.a!),
        beforeFull: await full(s.b!),
        afterFull: await full(s.a!),
      })),
  );
  return cache;
}
