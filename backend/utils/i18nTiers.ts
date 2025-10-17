const tiers = {
  en: [
    { tier: 'Founders', symbol: '🔥', myth: 'The First 25 who lit the chain' },
    { tier: 'Supporter', symbol: '🌱', myth: 'Those who nurtured the roots' },
    { tier: 'Crew', symbol: '⚙️', myth: 'Builders of the backstage' },
    { tier: 'Adult Access', symbol: '🔓', myth: 'Gatekeepers of the ritual' },
  ],
  ja: [
    { tier: 'Founders', symbol: '🔥', myth: '最初の25人がチェーンに火を灯した' },
    { tier: 'Supporter', symbol: '🌱', myth: '根を育てた者たち' },
    { tier: 'Crew', symbol: '⚙️', myth: '舞台裏の構築者' },
    { tier: 'Adult Access', symbol: '🔓', myth: '儀式の門番' },
  ],
  es: [
    { tier: 'Founders', symbol: '🔥', myth: 'Los primeros 25 que encendieron la cadena' },
    { tier: 'Supporter', symbol: '🌱', myth: 'Quienes nutrieron las raíces' },
    { tier: 'Crew', symbol: '⚙️', myth: 'Constructores del backstage' },
    { tier: 'Adult Access', symbol: '🔓', myth: 'Guardianes del ritual' },
  ],
  fr: [
    { tier: 'Founders', symbol: '🔥', myth: 'Les 25 premiers qui ont allumé la chaîne' },
    { tier: 'Supporter', symbol: '🌱', myth: 'Ceux qui ont nourri les racines' },
    { tier: 'Crew', symbol: '⚙️', myth: 'Bâtisseurs des coulisses' },
    { tier: 'Adult Access', symbol: '🔓', myth: 'Gardiens du rituel' },
  ],
};

export function getLocalizedTiers(locale: string) {
  return tiers[locale] || tiers['en'];
}
