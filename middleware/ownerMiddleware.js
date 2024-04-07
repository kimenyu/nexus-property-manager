import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Owner from '../models/ownerModel.js'
dotenv.config();


const jwt_secret = process.env.JWT_SECRET;

export const authenticateOwner = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access denied, token missing' });
    }

    try {
        const decoded = jwt.verify(token, jwt_secret);
        const owner = await Owner.findById(decoded.id);

        if (!owner || owner.role !== 'owner') {
            return res.status(401).json({ message: 'Access denied, invalid token' });
        }

        req.owner = owner;
        next();
    } catch (error) {
        console.error(error);

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Access denied, invalid token' });
        }

        return res.status(500).json({ message: 'Internal server error' });
    }
};
