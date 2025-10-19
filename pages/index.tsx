export const revalidate = 60;
import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation('common');

  const handleAgree = () => {
    router.push('/signup');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">{t('welcome')}</h1>
      <div className="max-w-xl text-center mb-6">
        <p className="mb-4">{t('reviewLegalDocs')}</p>
        <div className="bg-gray-800 p-4 rounded mb-4">
          <h2 className="text-2xl font-semibold mb-2">{t('tosTitle')}</h2>
          <p className="text-sm mb-2">
            {t('tosAgreement')}
            <Link href="/legal/terms-of-service" className="underline text-blue-400 mx-1" target="_blank" rel="noopener noreferrer">{t('termsOfService')}</Link>
            {t('and')}
            <Link href="/legal/privacy-policy" className="underline text-blue-400 mx-1" target="_blank" rel="noopener noreferrer">{t('privacyPolicy')}</Link>.
            {t('readCarefully')}
          </p>
        </div>
        <button onClick={handleAgree} className="bg-blue-600 px-6 py-3 rounded text-white font-bold">{t('agreeAndContinue')}</button>
      </div>
    </main>
  );
}
