import { Router } from 'express';
import { getUserTransaction, getAllTransactions } from '../controllers/getTenantTransactions.js';
import { authenticateTenant } from '../../middleware/tenantMiddleware.js';

export const tenantRouter = Router();

tenantRouter.get('/api/tenant/transactions', authenticateTenant, getUserTransaction);
tenantRouter.get('/api/transactions', getAllTransactions);
