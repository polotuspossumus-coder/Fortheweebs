import en from './i18n/en.json';
import es from './i18n/es.json';

const translations = { en, es };

export function t(key, lang = 'en') {
  return translations[lang][key] || key;
}
