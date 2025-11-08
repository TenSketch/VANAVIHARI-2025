import express from 'express'
import { handlePaymentCallback } from '../controllers/paymentController.js'

const router = express.Router()

// Payment gateway callback
router.post('/callback', handlePaymentCallback)

export default router
