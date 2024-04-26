import mongoose from 'mongoose';

const leaseSchema = new mongoose.Schema({
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true },
    startDate: { type: Date, default: Date.now},
    endDate: { type: Date },
    status: { type: String, default: 'not active' },
    rent: { type: Number, required: true },
    deposit: { type: Number, required: true},

});

const Lease = mongoose.model('Lease', leaseSchema);

export default Lease;