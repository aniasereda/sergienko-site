import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://vikaretoucher.win',
  output: 'static',
  integrations: [// privacy pages are left out of the sitemap until their text is added (remove the filter then)
    sitemap({ filter: (page) => !page.includes('privacy-policy') })],
});
