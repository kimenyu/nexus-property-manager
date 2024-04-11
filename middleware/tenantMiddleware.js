import jwt from 'jsonwebtoken';
import Tenant from '../models/tenantModel.js';

const jwt_secret = process.env.JWT_SECRET;

export const authenticateTenant = async (req, res, next) => {
  const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access denied, token missing' });
    }

    try {
        const decoded = jwt.verify(token, jwt_secret);
        const tenant = await Tenant.findById(decoded.id);

        if (!tenant || tenant.role !== 'tenant') {
            return res.status(401).json({ message: 'Access denied, invalid token' });
        }

        req.tenant = tenant;
        next();
    } catch (error) {
        console.error(error);

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Access denied, invalid token' });
        }

        return res.status(500).json({ message: 'Internal server error' });
    }
};
