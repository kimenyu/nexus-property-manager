import Tenant from '../../models/tenantModel.js';
import Transaction from '../../models/transactionModel.js';

export const getUserTransaction = async (req, res) => {
  const mytenant = req.tenant; // Use req.tenant directly

  try {
    const mytenantWithTransactions = await Tenant.findById(mytenant._id).populate('transactions'); // Populate transactions with actual documents

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
