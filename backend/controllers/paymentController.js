import Reservation from '../models/reservationModel.js'

export const handlePaymentCallback = async (req, res) => {
  try {
    // Parse payment gateway response
    const paymentData = req.body
    
    // Extract booking ID from payment response
    // Adjust based on your payment gateway's response format
    const bookingId = paymentData.txtAdditionalInfo2 || paymentData.bookingId
    
    // Determine payment status
    const isPaymentSuccess = paymentData.status === 'success' || paymentData.AuthStatus === '0300'
    
    // Update reservation payment status
    const updated = await Reservation.findOneAndUpdate(
      { bookingId },
      { 
        paymentStatus: isPaymentSuccess ? 'Paid' : 'Failed',
        rawSource: {
          ...paymentData
        }
      },
      { new: true }
    )
    
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Reservation not found' })
    }
    
    // Redirect to success/failure page
    if (isPaymentSuccess) {
      res.redirect(`${process.env.FRONTEND_URL}/booking-successfull?bookingId=${bookingId}`)
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/payment-failed?bookingId=${bookingId}`)
    }
  } catch (err) {
    console.error('Payment callback error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
}
