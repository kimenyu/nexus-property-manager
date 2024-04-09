import { Router } from 'express';
import { mpesaCallback, makeRentDeposits } from '../controllers/makeRentDeposits.js';
import { authenticateTenant } from '../../middleware/tenantMiddleware.js';

export const tenantRouter = Router();

tenantRouter.post('/api/tenant/stk/deposit', authenticateTenant, makeRentDeposits);
tenantRouter.post('/api/tenant/mpesa/callback', mpesaCallback);