import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.sergienko.space',
  output: 'static',
  integrations: [sitemap()],
});
