import Transaction from '../../models/transactionModel.js';
import Tenant from '../../models/tenantModel.js';
import Apartment from '../../models/apartmentModel.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();
import { Router } from 'express';

export const mpesaRouter = Router();


const generateToken = async (req, res, next) => {
    const auth = new Buffer.from(`${process.env.SAFARICOM_CONSUMER_KEY}:${process.env.SAFARICOM_CONSUMER_SECRET}`).toString('base64');

    await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        headers: {
            authorization: `Basic ${auth}`
        },
    }
    ).then((response) => {
        // console.log(data.data.access_token);
        const token = response.data.access_token;
        console.log(token);
        next();
    }).catch((err) => {
        console.log(err);
    })
}

mpesaRouter.post('/api/tenant/stk/deposit', generateToken,  async (req, res) => {
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
            PartyA: tenant.phone, // Use the tenant's phone number here
            PartyB: process.env.BUSINESS_SHORT_CODE,
            PhoneNumber: tenant.phone,
            CallBackURL: 'https://nexus-property-manager.onrender.com/api/tenant/mpesa/callback',
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

mpesaRouter.post('/api/tenant/mpesa/callback', async (req, res) => {
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