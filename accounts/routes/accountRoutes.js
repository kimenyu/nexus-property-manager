import { Router } from 'express';
import { createOwner, loginOwner, verifyEmailOwner } from '../controllers/ownerAccountsControllers.js';
import { createTenant, loginTenant, verifyEmailTenant } from '../controllers/tenantAccountControllers.js';
import { createCaretaker, verifyEmailCaretaker, loginCaretaker } from '../controllers/caretakerAccountControllers.js';

export const accountRouter = Router();

accountRouter.post('/api/owner/create', createOwner);
accountRouter.post('/api/owner/login', loginOwner);
accountRouter.post('/api/owner/verify', verifyEmailOwner);

accountRouter.post('/api/tenant/create', createTenant);
accountRouter.post('/api/tenant/login', loginTenant);
accountRouter.post('/api/tenant/verify', verifyEmailTenant);

accountRouter.post('/api/caretaker/create', createCaretaker);
accountRouter.post('/api/caretaker/login', loginCaretaker);
accountRouter.post('/api/caretaker/verify', verifyEmailCaretaker);

export default accountRouter;