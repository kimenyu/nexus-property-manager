import { Router } from 'express';
import { getUserTransaction, getAllTransactions, getRentTransactions } from '../controllers/getTenantTransactions.js';
import { authenticateTenant } from '../../middleware/tenantMiddleware.js';

export const tenantRouter = Router();

tenantRouter.get('/api/tenant/transactions', authenticateTenant, getUserTransaction);
tenantRouter.get('/api/tenant/rent/transactions', authenticateTenant, getRentTransactions);
tenantRouter.get('/api/transactions', getAllTransactions);
// tenantRouter.get('/api/:apartmentId/deposit/transactions', getDepositTransactionsForApartment);