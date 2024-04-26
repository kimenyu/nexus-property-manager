import { Router } from 'express';
import { createApartment, getAllApartments, getApartmentById, updateApartment, deleteApartment } from '../controllers/apartmentControllers.js';
import { assignApartment } from '../controllers/assignApartmentController.js';
import { authenticateOwner } from '../../middleware/ownerMiddleware.js';
import { authenticateTenant } from '../../middleware/tenantMiddleware.js';

export const apartmentRouter = Router();

// Create Apartment (Only accessible by authenticated owners)
apartmentRouter.post('/api/apartment/create', authenticateOwner, createApartment);

// Get All Apartments
apartmentRouter.get('/api/apartment/get-all', getAllApartments);

// Get Apartment by ID
apartmentRouter.get('/api/apartment/get/:id', getApartmentById);

// Update Apartment (Only accessible by authenticated owners)
apartmentRouter.put('/api/apartment/update/:id', authenticateOwner, updateApartment);

// Delete Apartment (Only accessible by authenticated owners)
apartmentRouter.delete('/api/apartment/delete/:id', authenticateOwner, deleteApartment);

apartmentRouter.post('/api/apartment/assign', authenticateTenant, assignApartment);