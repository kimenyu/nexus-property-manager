import { Router } from 'express';
import { createProperty, getAllProperties, getPropertyById, updateProperty, deleteProperty, listOwnerProperties } from '../controllers/propertyControllers.js';
import { authenticateOwner } from '../../middleware/ownerMiddleware.js';

export const propertyRouter = Router();

propertyRouter.post('/api/property/create', authenticateOwner, createProperty);
propertyRouter.get('/api/property/get-all', getAllProperties);
propertyRouter.get('/api/property/get/:id', getPropertyById);
propertyRouter.put('/api/property/update/:id', authenticateOwner, updateProperty);
propertyRouter.delete('/api/property/delete/:id', authenticateOwner, deleteProperty);
propertyRouter.get('/api/owner/properties', authenticateOwner, listOwnerProperties);