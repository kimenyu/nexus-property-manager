import mongoose from 'mongoose';

const rentSchema = new mongoose.Schema({
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true },
    amount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, default: 'active' },

});

rentSchema.pre('save', async function (next) {
    try {
        const apartment = await mongoose.model('Apartment').findById(this.apartment);
        if (apartment) {
            this.amount = apartment.rent;
        }
        next();
    } catch (error) {
        next(error);
    }
});
const Rent = mongoose.model('Rent', rentSchema);

export default Rent;