import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import banRoutes from './routes/ban.js';
import graveyardRoutes from './routes/graveyard.js';
import councilRoutes from './routes/council.js';
import ledgerRoutes from './routes/ledger.js';
import paymentRoutes from './routes/payment.js';
import governanceRoutes from './routes/governance.js';
import campaignRoutes from './routes/campaign.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/ban', banRoutes);
app.use('/graveyard', graveyardRoutes);
app.use('/propose-ban', councilRoutes);
app.use('/ledger', ledgerRoutes);
app.use('/payments', paymentRoutes);
app.use('/votes', governanceRoutes);
app.use('/campaigns', campaignRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log('Sovereign backend running...');
});
