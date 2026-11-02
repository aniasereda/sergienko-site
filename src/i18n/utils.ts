import enUi from './ui.en.json';
import ukUi from './ui.uk.json';
import enSite from '../content/en/site.json';
import enPrices from '../content/en/prices.json';
import enTurnaround from '../content/en/turnaround.json';
import enBooking from '../content/en/booking.json';
import enSteps from '../content/en/steps.json';
import enPortfolio from '../content/en/portfolio.json';
import ukSite from '../content/uk/site.json';
import ukPrices from '../content/uk/prices.json';
import ukTurnaround from '../content/uk/turnaround.json';
import ukBooking from '../content/uk/booking.json';
import ukSteps from '../content/uk/steps.json';
import ukPortfolio from '../content/uk/portfolio.json';

export type Lang = 'en' | 'uk';

const data = {
  en: { ui: enUi, site: enSite, prices: enPrices, turnaround: enTurnaround, booking: enBooking, steps: enSteps, portfolio: enPortfolio },
  uk: { ui: ukUi, site: ukSite, prices: ukPrices, turnaround: ukTurnaround, booking: ukBooking, steps: ukSteps, portfolio: ukPortfolio },
};

export const paths: Record<Lang, string> = { en: '/', uk: '/uk/' };

export function getData(lang: Lang) {
  return data[lang];
}
