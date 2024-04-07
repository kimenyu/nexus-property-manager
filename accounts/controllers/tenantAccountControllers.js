import Tenant from '../../models/tenantModel.js';
import isValidNumber from '../../utils/number-parser/numParser.js';
import bcrypt from 'bcrypt';
import emailValidator from 'email-validator';
import jwt from 'jsonwebtoken';
import generateVerificationCode from '../../utils/verification/verifyAccounts.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

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


export const createTenant = async (req, res) => {
    const { firstname, lastname, phone, email, password } = req.body;
    try {
      if (!firstname || !lastname || !phone || !email || !password) {
        return res.status(400).json({ error: "missing required parameters" });
      }
  
      //validate phone and email
      if (!isValidNumber(phone)) {
        return res.status(400).send({ error: "Please use a valid phone number" });
      }
  
      const existingPhoneNumber = await Tenant.findOne({ phone });
  
      if (existingPhoneNumber) {
        return res.status(400).send({ error: "Phone number is already in use" });
      }
  
      if (!emailValidator.validate(email)) {
        return res.status(400).send({ error: "Invalid Email Address" });
      }
      const existingEmail = await Tenant.findOne({ email });
  
      if (existingEmail) {
        return res.status(400).send({ error: "Email is already in use" });
      }
      const verificationCode = generateVerificationCode();
      //hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      //create admin user
      const newTenant = new Tenant({
        firstname,
        lastname,
        phone,
        email,
        password: hashedPassword,
        verificationCode
      });

      const result = await newTenant.save()
      const mailOptions = {
        from: process.env.SENDER_EMAIL, // Sender address
        to: email, // List of recipients
        subject: 'Code verification', // Subject line
        text: `Hello ${firstname},\n\nYour verification code is: ${verificationCode}.\n\nRegards,\nNexus Team` // Plain text body
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error(error);
          return res.status(500).json({ message: "Failed to send verification email" });
      } else {
          console.log('Email sent: ' + info.response);
          return res.status(201).json({ message: "Registration successful. Verification code sent to your email." });
      }
  });
  
  
      return res
        .status(201)
        .json({
          msg: "Tenant created successfully",
          user: result,
          
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
};

export const verifyEmailTenant =  async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
      // Find the customer by email
      const tenant = await Tenant.findOne({ email });

      if (!tenant) {
          return res.status(404).json({ message: "owner not found" });
      }

      // Check if the provided verification code matches the stored one
      if (tenant.verificationCode !== verificationCode) {
          return res.status(400).json({ message: "Invalid verification code" });
      }

      // Update customer verification status
      tenant.isVerified = true;
      await tenant.save();

      const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: email,
          subject: 'Account Verification Successful',
          text: 'Congratulations! Your account has been successfully verified.'
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.error(error);
              // Handle email sending error
          } else {
              console.log('Verification email sent: ' + info.response);
              // Handle email sending success
          }
      });

      return res.status(200).json({ message: "Verification successful" });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginTenant = async (req, res) => {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).json({ error: "missing required parameters" });
      }
  
      const tenant = await Tenant.findOne({ email });
  
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }
  
      const passwordMatch = await bcrypt.compare(password, tenant.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ error: "invalid credentials" });
      }
  
      const token = jwt.sign({ id: tenant._id }, jwtSecret, { expiresIn: '24h' });
  
      return res.status(200).json({ token });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
}