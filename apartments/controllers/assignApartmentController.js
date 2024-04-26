import Tenant from "../../models/tenantModel.js";
import Lease from "../../models/leaseModel.js";
import Apartment from "../../models/apartmentModel.js";
import Property from "../../models/propertyModel.js";

export const assignApartment = async (req, res) => {
    const tenant = req.tenant;
    const { apartmentId } = req.body;
    
    try {
        const apartment = await Apartment.findById(apartmentId);
        const mytenantWithTransactions = await Tenant.findById(tenant._id).populate('transactions').sort({ 'transactions.createdAt': -1 });

        console.log(mytenantWithTransactions);

        if (!apartment) {
            return res.status(404).json({ error: 'Apartment not found' });
        }

        if (apartment.isAvailable === false) {
            return res.status(400).json({ error: 'Apartment is already occupied' });
        }

        if (tenant.apartment) {
            return res.status(400).json({ error: 'Tenant already has an apartment' });
        }

        // Check if there are any transactions for the tenant
        if (!mytenantWithTransactions || mytenantWithTransactions.transactions.length === 0) {
            return res.status(400).json({ error: 'No transactions found for the tenant' });
        }

        const latestTransaction = mytenantWithTransactions.transactions[mytenantWithTransactions.transactions.length - 1];
        console.log('--------------------------');
        console.log(latestTransaction);
        console.log('--------------------------');

        // Check if the latest transaction is defined and meets the conditions
        if (!latestTransaction || latestTransaction.type !== 'deposit' || latestTransaction.status !== 'completed') {
            return res.status(400).json({ error: 'Tenant must have a completed deposit transaction' });
        }


        // Check if the latest transaction meets the conditions
        if (latestTransaction.type !== 'deposit' || latestTransaction.status !== 'completed') {
            return res.status(400).json({ error: 'Tenant must have a completed deposit transaction' });
        }

        // Check if the deposit amount is sufficient for the apartment
        console.log('latestTransaction.amount:', latestTransaction.Amount);
        console.log('apartment.deposit:', apartment.deposit);

        if (latestTransaction.Amount < apartment.deposit) {
            return res.status(400).json({ error: 'Tenant has not paid enough deposit' });
        }


        // Proceed with creating the lease and assigning the apartment
        const lease = new Lease({
            tenant: tenant._id,
            apartment: apartment._id,
            rent: apartment.rent,
            deposit: apartment.deposit,
        });

        apartment.isAvailable = false;
        tenant.apartment = apartment._id;
        lease.status = 'active';

        await lease.save();
        await apartment.save();
        await tenant.save();

        res.json({ message: 'Apartment assigned successfully' });

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


