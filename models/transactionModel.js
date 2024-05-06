import mongoose from 'mongoose';

const transactionType = ['deposit', 'rent' ];

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
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;