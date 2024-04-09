import { Router } from 'express';
import { mpesaCallback, makeRentDeposits, generateToken } from '../controllers/makeRentDeposits.js';
import { authenticateTenant } from '../../middleware/tenantMiddleware.js';

export const tenantRouter = Router();

tenantRouter.post('/api/tenant/stk/deposit', authenticateTenant, generateToken,makeRentDeposits);
tenantRouter.post('/api/tenant/mpesa/callback', mpesaCallback);