import mongoose from 'mongoose';

const rentSchema = new mongoose.Schema({
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true },
    amount: { type: Number, required: true },

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