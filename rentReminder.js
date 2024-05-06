import nodemailer from 'nodemailer';
import Tenant from "./models/tenantModel.js";
import Apartment from "./models/apartmentModel.js";
import dotenv from 'dotenv';
dotenv.config();

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

(async () => {
    try {
        // Find all tenants
        const tenants = await Tenant.find({});

        for (const tenant of tenants) {
            const apartment = await Apartment.findById(tenant.apartment);
            if (!apartment) {
                console.error(`Apartment not found for tenant ${tenant.email}`);
                continue;
            }

            // Send email reminder to each tenant
            await transporter.sendMail({
                from: process.env.SENDER_EMAIL,
                to: tenant.email,
                subject: 'Rent Reminder',
                text: `Dear ${tenant.firstname} ${tenant.lastname},\n\nThis is a reminder that your rent payment for Apartment ${apartment.number} is due today. Please make the payment of ${apartment.rent} USD at your earliest convenience.\n\nThank you,\nProperty Management Team`,
            });
            console.log(`Rent reminder sent to ${tenant.firstname} ${tenant.lastname} at ${tenant.email}`);
        }

        console.log('Rent reminders sent successfully to all tenants.');
    } catch (error) {
        console.error('Error sending rent reminders:', error);
    } finally {
        // Close the transporter
        transporter.close();
    }
})();
