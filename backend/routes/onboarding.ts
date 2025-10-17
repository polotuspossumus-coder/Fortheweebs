import { Router } from 'express';
import { getLocalizedTiers } from '../utils/i18nTiers';

const router = Router();

router.get('/onboarding', (req, res) => {
  const locale = (req.query.lang as string) || 'en';
  const tiers = getLocalizedTiers(locale as any);
  res.json({
    message: {
      en: 'Welcome to Fortheweebs. Choose your path.',
      ja: 'Fortheweebsへようこそ。あなたの道を選んでください。',
      es: 'Bienvenido a Fortheweebs. Elige tu camino.',
      fr: 'Bienvenue sur Fortheweebs. Choisissez votre voie.',
    }[locale] || 'Welcome to Fortheweebs. Choose your path.',
    tiers,
  });
});

export default router;
