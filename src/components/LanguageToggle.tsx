import { useRouter } from 'next/router';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'ko', label: '한국어' },
];

export default function LanguageToggle() {
  const router = useRouter();
  const { locale, asPath } = router;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    router.push(asPath, asPath, { locale: newLocale });
  };

  return (
    <div>
      <label htmlFor="language-toggle" className="sr-only">Select language</label>
      <select
        id="language-toggle"
        title="Select language"
        value={locale}
        onChange={handleChange}
        className="bg-gray-900 text-white p-2 rounded"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>{lang.label}</option>
        ))}
      </select>
    </div>
  );
}
