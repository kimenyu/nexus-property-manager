import mongoose from 'mongoose';

const transactionType = ['deposit', 'rent', 'service'];

const transactionSchema = new mongoose.Schema({
    MerchantRequestID: String,
    CheckoutRequestID: String,
    ResultCode: String,
    ResultDesc: String,
    Amount: Number,
    MpesaReceiptNumber: String,
    TransactionDate: Date,
    phone: String,
    type: { type: String, enum: transactionType, required: true },
    status: { type: String, default: 'pending' }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;