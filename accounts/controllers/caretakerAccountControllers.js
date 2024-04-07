import Caretaker from '../../models/caretakerModel.js';
import isValidNumber from '../../utils/number-parser/numParser.js';
import bcrypt from 'bcrypt';
import emailValidator from 'email-validator';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import generateVerificationCode from '../../utils/verification/verifyAccounts.js';
import nodemailer from 'nodemailer';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const JWT_EXPIRATION_TIME = '1d';


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

export const createCaretaker = async (req, res) => {
    const { firstname, lastname, phone, email, password } = req.body;
    try {
      if (!firstname || !lastname || !phone || !email || !password) {
        return res.status(400).json({ error: "missing required parameters" });
      }
  
      //validate phone and email
      if (!isValidNumber(phone)) {
        return res.status(400).send({ error: "Please use a valid phone number" });
      }
  
      const existingPhoneNumber = await Caretaker.findOne({ phone });
  
      if (existingPhoneNumber) {
        return res.status(400).send({ error: "Phone number is already in use" });
      }
  
      if (!emailValidator.validate(email)) {
        return res.status(400).send({ error: "Invalid Email Address" });
      }
      const existingEmail = await Caretaker.findOne({ email });
  
      if (existingEmail) {
        return res.status(400).send({ error: "Email is already in use" });
      }

      const verificationCode = generateVerificationCode();

      //hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      //create admin user
      const newCaretaker = new Caretaker({
        firstname,
        lastname,
        phone,
        email,
        password: hashedPassword,
        verificationCode
      });


      const result = await newCaretaker.save();

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
          msg: "user created successfully",
          user: result,
          
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
};

export const verifyEmailCaretaker =  async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        // Find the customer by email
        const caretaker = await Caretaker.findOne({ email });

        if (!caretaker) {
            return res.status(404).json({ message: "Caretaker not found" });
        }

        // Check if the provided verification code matches the stored one
        if (caretaker.verificationCode !== verificationCode) {
            return res.status(400).json({ message: "Invalid verification code" });
        }

        // Update customer verification status
        caretaker.isVerified = true;
        await caretaker.save();

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

export const loginCaretaker = async (req, res) => {
  const { email, password } = req.body;

  try {
      // Find the owner by email
      const caretaker = await Caretaker.findOne({ email });

      if (!caretaker) {
          return res.status(404).json({ message: 'Caretaker not found' });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, caretaker.password);

      if (!isMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check if the owner is verified
      if (!caretaker.isVerified) {
          return res.status(400).json({ message: 'Caretaker is not verified' });
      }

      // Generate JWT token
      const token = jwt.sign({ id: caretaker._id }, jwtSecret, { expiresIn: JWT_EXPIRATION_TIME });

      return res.status(200).json({ token });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};