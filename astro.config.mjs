import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://vikaretoucher.win',
  output: 'static',
  integrations: [sitemap()],
});
