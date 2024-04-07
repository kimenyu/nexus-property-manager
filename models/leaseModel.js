import mongoose from 'mongoose';

const leaseSchema = new mongoose.Schema({
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, default: 'active' },
    rent: { type: Number, required: true },
});

leaseSchema.pre('save', async function (next) {
    try {
        const apartment = await mongoose.model('Apartment').findById(this.apartment);
        if (apartment) {
            this.rent = apartment.rent;
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Lease = mongoose.model('Lease', leaseSchema);

export default Lease;