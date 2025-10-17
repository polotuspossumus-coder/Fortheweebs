import loreChainRoutes from './routes/loreChain';
app.use('/api', loreChainRoutes);
import creatorsRoutes from './routes/creators';
app.use('/api', creatorsRoutes);
import validatorsRoutes from './routes/validators';
app.use('/api', validatorsRoutes);
import protocolsRoutes from './routes/protocols';
app.use('/api', protocolsRoutes);
import leaderboardRoutes from './routes/leaderboard';
app.use('/api', leaderboardRoutes);
import onboardingRoutes from './routes/onboarding';
app.use('/api', onboardingRoutes);
import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from './middleware/validateRequest';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import logger from './logger';
import { setupMonitoring } from './monitoring';
import incentivesRoutes from './routes/incentives';
import authMiddleware from './middleware/authMiddleware';
import accessRoutes from './routes/access';
import artifactsRoutes from './routes/artifacts';
import onboardRoutes from './routes/onboard';
import logActionRoutes from './routes/logAction';
import referralsRoutes from './routes/referrals';

const app = express();
setupMonitoring(app);

const swaggerOptions = {
  encoding: 'utf8',
  failOnErrors: false,
  verbose: false,
  format: '.json',
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Fortheweebs API',
      version: '1.0.0',
import monitoringMiddleware from '../../backend/monitoring';
app.use(monitoringMiddleware);
    },
  },
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fortheweebs API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.ts'],
};
const specs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(helmet());
app.use(cors({ origin: 'https://fortheweebs.com' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json());

app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

app.use('/api', authMiddleware, incentivesRoutes);
app.post('/api/codex/update', body('wallet').isString(), validateRequest);
app.use('/api', accessRoutes);
app.use('/api', artifactsRoutes);
app.use('/api', onboardRoutes);
app.use('/api', logActionRoutes);
app.use('/api', referralsRoutes);

app.listen(3000, () => {
  logger.info('Fortheweebs backend running on port 3000');
});
// Duplicate code removed. Only the first block (lines 1–51) remains.
// ...existing code from lines 1-51...
