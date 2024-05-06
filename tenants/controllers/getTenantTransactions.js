import Tenant from '../../models/tenantModel.js';
import Transaction from '../../models/transactionModel.js';
import Apartment from '../../models/apartmentModel.js';

export const getUserTransaction = async (req, res) => {
  const mytenant = req.tenant; // Use req.tenant directly

  try {
    const mytenantWithTransactions = await Tenant.findById(mytenant._id).populate('transactions'); // Populate transactions with actual documents
    console.log(mytenantWithTransactions);
    if (!mytenantWithTransactions) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Extract transactions from the populated field
    const transactions = mytenantWithTransactions.transactions;

    // Send the transactions array as a JSON response
    res.json({ transactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


//get tenant transactions where type is rent
export const getRentTransactions = async (req, res) => {
  const mytenant = req.tenant; // Use req.tenant directly

  try {
    const mytenantWithRentTransactions = await Tenant.findById(mytenant._id).populate({
      path: 'transactions',
      match: { type: 'rent' }, // Match transactions where type is 'rent'
    });

    if (!mytenantWithRentTransactions) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Extract rent transactions from the populated field
    const rentTransactions = mytenantWithRentTransactions.transactions;
    
    // Send the rent transactions array as a JSON response
    res.json({ rentTransactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


//get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({});

    res.json({ transactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}



// export const getDepositTransactionsForApartment = async (req, res) => {
//     try {
//         const { apartmentId } = req.params;

//         // Find tenants of the apartment
//         const tenants = await Tenant.find({ apartment: apartmentId }).select('phone');
//         console.log(tenants);
//         if (!tenants || tenants.length === 0) {
//             return res.status(404).json({ error: 'No tenants found for this apartment' });
//         }

//         // Get phone numbers of the tenants
//         const tenantPhones = tenants.map(tenant => tenant.phone);

//         // Get deposit transactions for the tenants of the apartment based on phone numbers
//         const depositTransactions = await Transaction.find({
//             type: 'deposit',
//             status: 'completed',
//             phone: { $in: tenantPhones }
//         });

//         res.status(200).json({ depositTransactions });
//     } catch (error) {
//         console.error('Error fetching deposit transactions:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// };
