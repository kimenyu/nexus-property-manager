import Tenant from "../../models/tenantModel.js";
import Apartment from "../../models/apartmentModel.js";
import Property from "../../models/propertyModel.js";

//get tenants for a particular apartment
export const getTenantsForApartment = async (req, res) => {
    const { propertyId } = req.params;
    const myowner = req.owner;

    try {
        // Find the property by its ID and check if the owner is the same
        const property = await Property.findOne({ _id: propertyId, owner: myowner._id });
        if (!property) {
        return res.status(404).json({ error: 'Property not found or you are not the owner' });
        }

        // Find all apartments belonging to the specified property
        const apartmentsForProperty = await Apartment.find({ property: propertyId });

        // Extract apartment IDs from the apartmentsForProperty array
        const apartmentIds = apartmentsForProperty.map(apartment => apartment._id);

        // Find all tenants that belong to any of the apartments for the property
        const tenantsForProperty = await Tenant.find({ apartment: { $in: apartmentIds } }).populate('transactions');

        // Send the tenants array as a JSON response
        res.json({ tenants: tenantsForProperty });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
  