import express from "express";
import axios from 'axios';
import mongoose from "mongoose";
import Transaction from "./models/transactionModel.js";
import Tenant from "./models/tenantModel.js";
import { accountRouter } from "./accounts/routes/accountRoutes.js";
import { propertyRouter } from './properties/routes/propertyRoutes.js';
import { apartmentRouter } from './apartments/routes/apartmentRoutes.js';
import { tenantRouter } from './tenants/routes/tenantRoutes.js';



import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send("Hello, this is my api running........");
})

app.use(express.json());


// Cors middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

let token;

const generateToken = async (req, res, next) => {
  const auth = new Buffer.from(`${process.env.SAFARICOM_CONSUMER_KEY}:${process.env.SAFARICOM_CONSUMER_SECRET}`).toString('base64');

  await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: {
          authorization: `Basic ${auth}`
      },
  }
  ).then((response) => {
      // console.log(data.data.access_token);
      token = response.data.access_token;
      console.log(token);
      next();
  }).catch((err) => {
      console.log(err);
  })
}

app.post("/stk", generateToken, async (req, res) => {
    const { tenantId, amount } = req.body;
  
    try {
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }
  
      const date = new Date();
      const timestamp =
        date.getFullYear().toString() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);
  
      const password = new Buffer.from(process.env.BUSINESS_SHORT_CODE + process.env.PASS_KEY + timestamp).toString('base64');
  
      await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
          BusinessShortCode: process.env.BUSINESS_SHORT_CODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: tenant?.phone?.slice(1), // Use optional chaining to safely access properties
          PartyB: process.env.BUSINESS_SHORT_CODE,
          PhoneNumber: tenant?.phone?.slice(1),
          CallBackURL: 'https://nexus-property-manager.onrender.com/callback',
          AccountReference: "Moja Nexus",
          TransactionDesc: "Paid online",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).then((data) => {
        res.status(200).json(data.data);
      }).catch((err) => {
        console.log(err.message);
        res.status(500).json({ message: 'Internal server error' });
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
});  

app.post('/callback', async (req, res) => {
    const callbackData = req.body;

    // Log the callback data to the console
    console.log(callbackData.Body);

    if (!callbackData.Body.stkCallback.CallbackMetadata) {
        console.log(callbackData.Body);
        return res.json('ok');
    }

    console.log(callbackData.Body.stkCallback.CallbackMetadata);

    // Extract TransactionDate from CallbackMetadata Item array
    const transactionDateItem = callbackData.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'TransactionDate');

    let transactionDate;
    if (transactionDateItem) {
        // Parse the TransactionDate value to a Date object
        transactionDate = new Date(transactionDateItem.Value);
    } else {
        console.error('TransactionDate not found in callback data.');
        return res.status(400).json({ message: 'TransactionDate not found in callback data' });
    }

    // Ensure transactionDate is a valid Date object
    if (isNaN(transactionDate.getTime())) {
        console.error('Invalid TransactionDate value:', transactionDateItem.Value);
        return res.status(400).json({ message: 'Invalid TransactionDate value' });
    }

    const newTransaction = new Transaction({
        MpesaReceiptNumber: callbackData.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber')?.Value,
        amount: callbackData.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'Amount')?.Value,
        TransactionDate: transactionDate, // Use parsed TransactionDate value
        MerchantRequestID: callbackData.Body.stkCallback.MerchantRequestID,
        CheckoutRequestID: callbackData.Body.stkCallback.CheckoutRequestID,
        ResultCode: callbackData.Body.stkCallback.ResultCode,
        ResultDesc: callbackData.Body.stkCallback.ResultDesc,
        phone: callbackData.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'PhoneNumber')?.Value,
        type: 'deposit',
        status: 'completed',
    });
 

    if (
        callbackData.Body.stkCallback.ResultCode !== 0
    ) {
        newTransaction.status = 'failed';
    }

    try {
        // Save the new transaction
        await newTransaction.save();

        // Construct the phone number with the country code
        const phoneNumberWithCode = `+${callbackData.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'PhoneNumber')?.Value}`;
        console.log('Phone Number with Code:', phoneNumberWithCode);

        // Find the tenant by phone number (including country code)
        const tenant = await Tenant.findOne({ phone: phoneNumberWithCode });

        // Log the found tenant
        console.log('Found tenant:', tenant);

        if (tenant) {
            // Push the new transaction ID into the tenant's transactions array
            tenant.transactions.push(newTransaction._id);

            // Save the updated tenant
            await tenant.save();

            // Log the updated tenant
            console.log('Updated tenant:', tenant);

            return res.json('ok');
        } else {
            console.log('Tenant not found');
            return res.status(404).json({ message: 'Tenant not found' });
        }
    } catch (error) {
        console.error('Error saving transaction or updating tenant:', error);
        return res.status(500).json({ message: 'Error saving transaction or updating tenant' });
    }
});

app.use(accountRouter, propertyRouter, apartmentRouter, tenantRouter);