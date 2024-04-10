import express from "express";
import axios from 'axios';
import mongoose from "mongoose";
import Transaction from "./models/transactionModel.js";
import Tenant from "./models/tenantModel.js";
import { accountRouter } from "./accounts/routes/accountRoutes.js";
import { propertyRouter } from './properties/routes/propertyRoutes.js';
import { apartmentRouter } from './apartments/routes/apartmentRoutes.js';



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

app.post("/stk", generateToken, async(req, res) => {
  const { tenantId, amount } = req.body;
  const tenant = await Tenant.findById(tenantId);
  const date = new Date();

  const timestamp = 
  date.getFullYear().toString() +
  ("0" + (date.getMonth() + 1)).slice(-2) +
  ("0" + date.getDate()).slice(-2) +
  ("0" + date.getHours()).slice(-2) +
  ("0" + date.getMinutes()).slice(-2) +
  ("0" + date.getSeconds()).slice(-2);

  const password = new Buffer.from(process.env.BUSINESS_SHORT_CODE + process.env.PASS_KEY + timestamp).toString('base64');

  await axios.post (
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
          BusinessShortCode: process.env.BUSINESS_SHORT_CODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: tenant.phone.slice(1), // Use the tenant's phone number here
          PartyB: process.env.BUSINESS_SHORT_CODE,
          PhoneNumber: tenant.phone.slice(1),
          CallBackURL: 'https://nexus-property-manager.onrender.com/callback',
          AccountReference: "Moja Nexus",
          TransactionDesc: "Paid online",

      },
      {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      }
  ).then ((data) => {
      res.status(200).json(data.data);
  }).catch((err) => {
      console.log(err.message);
  })
})

app.post('/callback', async(req, res) => {
  const callbackData = req.body;

  // Log the callback data to the console
  console.log(callbackData.Body);

  if(!callbackData.Body.stkCallback.CallbackMetadata) {
      console.log(callbackData.Body);
      return res.json('ok');
  }

  console.log(callbackData.Body.stkCallback.CallbackMetadata);

  const newTransaction = new Transaction({
      MpesaReceiptNumber: callbackData.Body.stkCallback.CallbackMetadata.Item[1].Value,
      amount: callbackData.Body.stkCallback.CallbackMetadata.Item[0].Value,
      TransactionDate: callbackData.Body.stkCallback.CallbackMetadata.Item[3].Value,
      MerchantRequestID: callbackData.Body.stkCallback.MerchantRequestID,
      CheckoutRequestID: callbackData.Body.stkCallback.CheckoutRequestID,
      ResultCode: callbackData.Body.stkCallback.ResultCode,
      ResultDesc: callbackData.Body.stkCallback.ResultDesc,
      PhoneNumber: callbackData.Body.stkCallback.CallbackMetadata.Item[4].Value,
      type: 'deposit',
      status: 'completed',
  });

  if (callbackData.Body.stkCallback.CallbackMetadata.Item[0].Value < 0 || callbackData.Body.stkCallback.ResultCode !== 0 || callbackData.Body.stkCallback.ResultDesc !== 'The service request is processed successfully.') {
      newTransaction.status = 'failed';
  }

  await newTransaction.save();

  const tenant = await Tenant.findOne({ phone: callbackData.Body.stkCallback.CallbackMetadata.Item[4].Value });

  if (tenant) {
      tenant.transactions.push(newTransaction._id);
      await tenant.save();
  }

  return res.json('ok');
})

app.use(accountRouter, propertyRouter, apartmentRouter);
