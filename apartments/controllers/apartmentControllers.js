import Apartment from "../../models/apartmentModel.js";
import Property from "../../models/propertyModel.js";  
import { authenticateOwner } from "../../middleware/ownerMiddleware.js";


// Create Apartment
export const createApartment = async (req, res) => {
    const owner = req.owner; // Obtained from the middleware
    const { number, propertyId,  type, description, rent, deposit, image, video, amenities } = req.body;

    try {
        const property = await Property.findById(propertyId);
        if (!property || property.owner.toString() !== owner._id.toString()) {
            return res.status(404).json({ message: 'Property not found or you are not the owner' });
        }

        const newApartment = new Apartment({
            number,
            property: propertyId,
            type,
            description,
            rent,
            deposit,
            image,
            video,
            amenities,
        });

        
        const result = await newApartment.save();
        property.apartments.push(newApartment._id);
        await property.save();

        return res.status(201).json({ message: 'Apartment created successfully', apartment: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get All Apartments
export const getAllApartments = async (req, res) => {
    try {
        const apartments = await Apartment.find().populate('property');
        return res.status(200).json({ apartments });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Apartment by ID
export const getApartmentById = async (req, res) => {
    const { id } = req.params;
    try {
        const apartment = await Apartment.findById(id).populate('property');
        if (!apartment) {
            return res.status(404).json({ message: 'Apartment not found' });
        }
        return res.status(200).json({ apartment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Apartment
export const updateApartment = async (req, res) => {
    const owner = req.owner; // Obtained from the middleware
    const { id } = req.params;
    const { number, propertyId, type, description, rent, deposit, image, video, amenities } = req.body;

    try {
        const apartment = await Apartment.findById(id);
        if (!apartment) {
            return res.status(404).json({ message: 'Apartment not found' });
        }

        const property = await Property.findById(propertyId);
        if (!property || property.owner.toString() !== owner._id.toString()) {
            return res.status(404).json({ message: 'Property not found or you are not the owner' });
        }

        apartment.number = number;
        apartment.property = propertyId;
        apartment.type = type;
        apartment.description = description;
        apartment.rent = rent;
        apartment.deposit = deposit;
        apartment.image = image;
        apartment.video = video;
        apartment.amenities = amenities;

        const updatedApartment = await apartment.save();
        return res.status(200).json({ message: 'Apartment updated successfully', apartment: updatedApartment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete Apartment
export const deleteApartment = async (req, res) => {
    const owner = req.owner; // Obtained from the middleware
    const { id } = req.params;
    try {
        const apartment = await Apartment.findById(id);
        if (!apartment) {
            return res.status(404).json({ message: 'Apartment not found' });
        }

        const property = await Property.findById(apartment.property);
        if (!property || property.owner.toString() !== owner._id.toString()) {
            return res.status(404).json({ message: 'Property not found or you are not the owner' });
        }

        // Delete the apartment document
        await Apartment.deleteOne({ _id: id });

        return res.status(200).json({ message: 'Apartment deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
