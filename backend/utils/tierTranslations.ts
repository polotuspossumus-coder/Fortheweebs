type Locale = 'en' | 'es' | 'ja' | 'fr' | 'de' | 'pt' | 'zh';

const tierTranslations: Record<Locale, Record<string, string>> = {
  en: {
    Founders: 'Founders (100% profit)',
    Standard: 'Standard (95% profit)',
    Supporter: 'Supporter (85% profit)',
    Crew: 'Crew (50% profit)',
    Adult: 'Adult Access (25% profit)',
  },
  ja: {
    Founders: '創設者（利益100％）',
    Standard: '標準（利益95％）',
    Supporter: 'サポーター（利益85％）',
    Crew: 'クルー（利益50％）',
    Adult: 'アダルトアクセス（利益25％）',
  },
  // Add more locales...
};

export function getLocalizedTiers(locale: Locale = 'en') {
  const base = tierTranslations[locale] || tierTranslations['en'];
  return Object.entries(base).map(([key, label]) => ({ tier: key, label }));
}
