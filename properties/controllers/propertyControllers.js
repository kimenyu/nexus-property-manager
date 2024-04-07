import Property from '../../models/propertyModel.js';
import Owner from '../../models/ownerModel.js';
import jwt from 'jsonwebtoken';


export const createProperty = async (req, res) => {
    const { name, address, propertyType, description, price, image, location, amenities } = req.body;
    const owner = req.owner; // Obtained from the middleware

    try {
        const newProperty = new Property({
            name,
            address,
            owner: owner._id,
            propertyType,
            description,
            price,
            image,
            location,
            amenities,
        });

        const result = await newProperty.save();
        owner.properties.push(newProperty._id);
        await owner.save();

        return res.status(201).json({ message: 'Property created successfully', property: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


export const getAllProperties = async (req, res) => {
    try {
        const properties = await Property.find();
        const propertyCount = properties.length;
        console.log(propertyCount);
        return res.status(200).json({ properties, propertyCount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const listOwnerProperties = async (req, res) => {
    const owner = req.owner; // Obtained from the middleware

    try {
        // Find all properties owned by the specified owner
        const properties = await Property.find({ owner: owner._id });
        const propertyCount = properties.length;

        return res.status(200).json({ properties, propertyCount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPropertyById = async (req, res) => {
    const { id } = req.params;
    try {
        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        return res.status(200).json({ property });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


export const updateProperty = async (req, res) => {
    const { id } = req.params;
    const { name, address, type, description, price, image, location, amenities } = req.body;

    try {
        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Update property fields
        property.name = name;
        property.address = address;
        property.propertyType = propertyType;
        property.description = description;
        property.price = price;
        property.image = image;
        property.location = location;
        property.amenities = amenities;

        // Save updated property
        const updatedProperty = await property.save();

        // Update owner's properties array if needed
        const owner = await Owner.findById(property.owner);
        if (owner) {
            // Check if the property ID is not already in the owner's properties array
            if (!owner.properties.includes(property._id)) {
                owner.properties.push(property._id);
                await owner.save();
            }
        }

        return res.status(200).json({ message: 'Property updated successfully', property: updatedProperty });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteProperty = async (req, res) => {
    const { id } = req.params;
    try {
        const property = await Property.findByIdAndDelete(id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        // Remove property ID from owner's properties array
        const owner = await Owner.findById(property.owner);
        if (owner) {
            owner.properties.pull(property._id);
            await owner.save();
        }
        return res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
