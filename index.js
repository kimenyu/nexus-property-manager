import express from "express";
import mongoose from "mongoose";
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




app.use(accountRouter, propertyRouter, apartmentRouter, tenantRouter);