import express from "express";
import { initiatePayment, handlePaymentCallback } from "../controllers/paymentController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// Initiate payment (requires user authentication)
router.post("/initiate", auth, initiatePayment);

// Payment callback from BillDesk (no auth required - BillDesk calls this)
router.post("/callback", handlePaymentCallback);
router.get("/callback", handlePaymentCallback); // Some gateways use GET

export default router;
