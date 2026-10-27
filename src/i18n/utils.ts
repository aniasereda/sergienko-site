import enUi from './ui.en.json';
import ukUi from './ui.uk.json';
import enSite from '../content/en/site.json';
import enPrices from '../content/en/prices.json';
import enSteps from '../content/en/steps.json';
import enFaq from '../content/en/faq.json';
import enPortfolio from '../content/en/portfolio.json';
import ukSite from '../content/uk/site.json';
import ukPrices from '../content/uk/prices.json';
import ukSteps from '../content/uk/steps.json';
import ukFaq from '../content/uk/faq.json';
import ukPortfolio from '../content/uk/portfolio.json';

export type Lang = 'en' | 'uk';

const data = {
  en: { ui: enUi, site: enSite, prices: enPrices, steps: enSteps.items, faq: enFaq.items, portfolio: enPortfolio },
  uk: { ui: ukUi, site: ukSite, prices: ukPrices, steps: ukSteps.items, faq: ukFaq.items, portfolio: ukPortfolio },
};

export const paths: Record<Lang, string> = { en: '/', uk: '/uk/' };

export function getData(lang: Lang) {
  return data[lang];
}
