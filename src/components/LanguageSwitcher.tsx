import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) i18n.changeLanguage(savedLang);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng); // optional persistence
  };

  return (
    <select
      aria-label="Language selection"
      title="Choose your language"
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
      className="language-switcher"
    >
      <option value="en">🇺🇸 English</option>
      <option value="es">🇪🇸 Español</option>
      <option value="ja">🇯🇵 日本語</option>
    </select>
  );
}
