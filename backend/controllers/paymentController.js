import { encryptRequest, signEncryptedRequest, decryptResponse, verifySignature } from "../services/billdeskCrypto.js";
import { sendToBillDesk } from "../services/sendToBilldesk.js";
import Reservation from "../models/reservationModel.js";
import PaymentTransaction from "../models/paymentTransactionModel.js";
import Resort from "../models/resortModel.js";
import Room from "../models/roomModel.js";
import transporter from "../config/nodemailer.js";
import { RESERVATION_SUCCESS_EMAIL_TEMPLATE, RESERVATION_SUCCESS_EMAIL_ADMIN_TEMPLATE } from "../config/emailTemplates.js";

// Helper function to send reservation success emails
async function sendReservationSuccessEmails(reservation, paymentTransaction) {
  try {
    // Fetch resort details
    let resortData = null;
    if (reservation.resort) {
      resortData = await Resort.findById(reservation.resort).lean();
    }

    // Fetch room details
    let roomsData = [];
    if (reservation.rooms && Array.isArray(reservation.rooms)) {
      roomsData = await Room.find({ _id: { $in: reservation.rooms } }).lean();
    }

    const resortName = resortData?.resortName || reservation.rawSource?.resortName || 'Resort';
    const roomList = roomsData.map(r => r.roomName || r.roomNumber).join(', ') || 'N/A';
    
    // Format dates
    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });

    // Prepare email data
    const emailData = {
      Full_Name: reservation.fullName,
      Guest_Details: `${reservation.fullName}\n${reservation.email}\n${reservation.phone}\n${reservation.address1}, ${reservation.city}, ${reservation.state} - ${reservation.postalCode}`,
      Reservation_Date: formatDate(reservation.reservationDate),
      Booking_Id: reservation.bookingId,
      Room_List: roomList,
      Check_In: formatDate(reservation.checkIn),
      Check_Out: formatDate(reservation.checkOut),
      Total_Guests: (reservation.guests || 0) + (reservation.extraGuests || 0) + (reservation.children || 0),
      Payment_Amount: `INR ${reservation.totalPayable?.toFixed(2)}`,
      Transaction_ID: reservation.rawSource?.transactionId || paymentTransaction.transactionId || 'N/A',
      Payment_Date: formatDate(paymentTransaction.updatedAt || new Date()),
      Payment_Status: 'Confirmed',
      Food_Providing: resortName.includes('Jungle Star') ? 'Yes' : 'No',
      Contact_Person_Name: 'Mr. Veerababu',
      Resort_Name: resortName,
      Support_Number: '+919494151617',
      Email: 'info@vanavihari.com',
      Website: 'www.vanavihari.com'
    };

    // Replace placeholders in templates
    let userEmail = RESERVATION_SUCCESS_EMAIL_TEMPLATE;
    let adminEmail = RESERVATION_SUCCESS_EMAIL_ADMIN_TEMPLATE;

    Object.keys(emailData).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      userEmail = userEmail.replace(regex, emailData[key]);
      adminEmail = adminEmail.replace(regex, emailData[key]);
    });

    // Handle conditional food menu (Nunjucks-style)
    if (emailData.Food_Providing === 'Yes') {
      userEmail = userEmail.replace(/{% if Food_Providing == "Yes" %}/g, '');
      userEmail = userEmail.replace(/{% endif %}/g, '');
    } else {
      userEmail = userEmail.replace(/{% if Food_Providing == "Yes" %}[\s\S]*?{% endif %}/g, '');
    }

    // Send email to user
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: reservation.email,
      subject: `Booking Confirmation - ${reservation.bookingId}`,
      html: userEmail
    });

    console.log(`✅ Confirmation email sent to user: ${reservation.email}`);

    // Send email to admin
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: process.env.ADMIN_EMAIL || 'info@vanavihari.com',
      subject: `New Booking - ${reservation.bookingId} - ${resortName}`,
      html: adminEmail
    });

    console.log(`✅ Notification email sent to admin`);

  } catch (error) {
    console.error('❌ Error sending reservation emails:', error);
    // Don't throw error - email failure shouldn't break the payment flow
  }
}

// Initiate payment - creates BillDesk order and returns data for form submission
export const initiatePayment = async (req, res) => {
  let debugInfo = {};

  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, error: 'Booking ID is required' });
    }

    // Fetch reservation details
    const reservation = await Reservation.findOne({ bookingId }).lean();
    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    // Check if reservation is pre-reserved and not expired
    if (reservation.status !== 'pre-reserved') {
      return res.status(400).json({ success: false, error: 'Reservation is not in pre-reserved state' });
    }

    if (new Date() > new Date(reservation.expiresAt)) {
      return res.status(400).json({ success: false, error: 'Reservation has expired' });
    }

    // Convert to IST (UTC+5:30) without milliseconds
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const orderDate = istDate.toISOString().split('.')[0] + '+05:30';

    // Generate unique order ID (use bookingId)
    const orderId = bookingId;

    // Prepare order data
    const orderData = {
      mercid: process.env.BILLDESK_MERCID,
      orderid: orderId,
      amount: reservation.totalPayable.toFixed(2),
      order_date: orderDate,
      currency: "356",
      ru: process.env.BILLDESK_RETURN_URL,
      additional_info: {
        additional_info1: reservation.fullName || '',
        additional_info2: reservation.phone || '',
        additional_info3: reservation.email || '',
        additional_info7: reservation.rawSource?.resortName || 'resort'
      },
      itemcode: "DIRECT",
      device: {
        init_channel: "internet",
        ip: req.ip || "127.0.0.1",
        user_agent: req.headers['user-agent'] || "Mozilla/5.0",
        accept_header: "text/html"
      }
    };

    const encKey = process.env.BILLDESK_ENCRYPTION_KEY;
    const signKey = process.env.BILLDESK_SIGNING_KEY;
    const keyId = process.env.KEY_ID;
    const clientId = process.env.BILLDESK_CLIENTID;

    console.log("\n=== PAYMENT INITIATION ===");
    console.log("Booking ID:", bookingId);
    console.log("Order Data:", JSON.stringify(orderData, null, 2));

    // Encrypt request
    const encrypted = await encryptRequest(orderData, encKey, keyId, clientId);
    console.log("Encrypted Request:", encrypted);

    // Sign encrypted request
    const signed = await signEncryptedRequest(encrypted, signKey, keyId, clientId);
    console.log("Signed Request:", signed);

    // Generate trace ID and timestamp
    const traceId = "TID" + Math.random().toString(36).slice(2, 14).toUpperCase();
    const timestamp = Date.now().toString();
    console.log("Trace ID:", traceId);
    console.log("Timestamp:", timestamp);
    console.log("=========================\n");

    // Store debug info
    debugInfo = {
      jsonRequest: orderData,
      encryptedRequest: encrypted,
      signedRequest: signed,
      traceId: traceId,
      timestamp: timestamp
    };

    // Send to BillDesk to create order
    try {
      const billdeskResponse = await sendToBillDesk(signed, traceId, timestamp);

      // Create payment transaction record
      const paymentTransaction = new PaymentTransaction({
        bookingId: bookingId,
        reservationId: reservation._id.toString(),
        bdOrderId: billdeskResponse.bdorderid || orderId,
        amount: reservation.totalPayable,
        status: 'initiated',
        traceId: traceId,
        timestamp: timestamp,
        encryptedRequest: signed,
        customerDetails: {
          name: reservation.fullName,
          phone: reservation.phone,
          email: reservation.email
        }
      });
      await paymentTransaction.save();

      // Update reservation with payment transaction reference
      await Reservation.findOneAndUpdate(
        { bookingId },
        { paymentTransactionId: paymentTransaction._id.toString() }
      );

      // Return data for frontend to submit form
      // Note: Form uses 'merchantid' but BillDesk response has 'mercid'
      const merchantId = billdeskResponse.mercid || billdeskResponse.links?.[1]?.parameters?.mercid || process.env.BILLDESK_MERCID;
      const bdorderid = billdeskResponse.bdorderid;
      const rdata = billdeskResponse.links?.[1]?.parameters?.rdata;
      const formAction = billdeskResponse.links?.[1]?.href || 'https://uat1.billdesk.com/u2/web/v1_2/embeddedsdk';
      
      console.log('\n=== Payment Data for Frontend ===');
      console.log('merchantid:', merchantId);
      console.log('bdorderid:', bdorderid);
      console.log('rdata:', rdata?.substring(0, 50) + '...');
      console.log('formAction:', formAction);
      console.log('================================\n');
      
      // Validate all required fields are present
      if (!merchantId || !bdorderid || !rdata) {
        console.error('Missing required payment fields!');
        console.error('merchantId:', merchantId);
        console.error('bdorderid:', bdorderid);
        console.error('rdata:', rdata ? 'present' : 'MISSING');
        return res.status(500).json({
          success: false,
          error: 'Missing required payment fields from BillDesk response'
        });
      }
      
      return res.status(200).json({
        success: true,
        paymentData: {
          merchantid: merchantId,
          bdorderid: bdorderid,
          rdata: rdata,
          formAction: formAction
        },
        debug: debugInfo
      });
    } catch (bdError) {
      console.error("BillDesk Error:", bdError);

      return res.status(bdError.statusCode || 500).json({
        success: false,
        error: bdError.message,
        debug: debugInfo,
        billdesk_error: bdError.billdeskError || null
      });
    }

  } catch (err) {
    console.error("initiatePayment Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
      debug: debugInfo
    });
  }
};

// Handle payment callback from BillDesk
export const handlePaymentCallback = async (req, res) => {
  try {
    console.log("\n=== PAYMENT CALLBACK RECEIVED ===");
    console.log("Request Method:", req.method);
    console.log("Request Headers:", req.headers);
    console.log("Request Body:", req.body);
    console.log("Request Query:", req.query);
    console.log("Request Params:", req.params);
    console.log("Raw Body:", req.rawBody);

    // BillDesk sends encrypted response in different field names
    // Try multiple sources
    const encryptedResponse = req.body?.transaction_response 
      || req.body?.msg 
      || req.query?.msg 
      || req.body?.response 
      || req.query?.response;

    if (!encryptedResponse) {
      console.error("❌ No encrypted response received");
      console.error("Available keys in body:", req.body ? Object.keys(req.body) : 'body is undefined');
      console.error("Available keys in query:", req.query ? Object.keys(req.query) : 'query is undefined');
      return res.redirect(`${process.env.FRONTEND_URL}/booking-failed?error=no_response`);
    }

    console.log("✅ Found encrypted response in:", req.body?.transaction_response ? 'transaction_response' : 'msg');

    const encKey = process.env.BILLDESK_ENCRYPTION_KEY;
    const signKey = process.env.BILLDESK_SIGNING_KEY;

    // Verify signature
    const isValid = await verifySignature(encryptedResponse, signKey);
    if (!isValid) {
      console.error("Invalid signature");
      return res.redirect(`${process.env.FRONTEND_URL}/booking-failed?error=invalid_signature`);
    }

    // Decrypt response
    const decryptedResponse = await decryptResponse(encryptedResponse, encKey);
    console.log("Decrypted Response:", JSON.stringify(decryptedResponse, null, 2));

    const {
      orderid: bookingId,
      transactionid,
      auth_status,
      amount,
      transaction_error_type,
      transaction_error_desc
    } = decryptedResponse;

    // Find reservation
    const reservation = await Reservation.findOne({ bookingId });
    if (!reservation) {
      console.error("Reservation not found:", bookingId);
      return res.redirect(`${process.env.FRONTEND_URL}/booking-failed?error=reservation_not_found`);
    }

    // Find payment transaction
    const paymentTransaction = await PaymentTransaction.findOne({ bookingId });

    // Update payment transaction
    if (paymentTransaction) {
      paymentTransaction.transactionId = transactionid;
      paymentTransaction.authStatus = auth_status;
      paymentTransaction.decryptedResponse = decryptedResponse;
      
      // Determine status based on auth_status
      if (auth_status === '0300') {
        // Success
        paymentTransaction.status = 'success';
        reservation.status = 'reserved';
        reservation.paymentStatus = 'paid';
        reservation.expiresAt = null; // Clear expiry
        // Store transaction ID in rawSource for easy access
        if (!reservation.rawSource) reservation.rawSource = {};
        reservation.rawSource.transactionId = transactionid;
        reservation.rawSource.bankRefNo = decryptedResponse.bank_ref_no;
        reservation.rawSource.authCode = decryptedResponse.authcode;
        // Mark rawSource as modified for Mongoose to save it
        reservation.markModified('rawSource');
      } else if (auth_status === '0399') {
        // Failed
        paymentTransaction.status = 'failed';
        paymentTransaction.errorMessage = transaction_error_desc;
        reservation.status = 'cancelled';
        reservation.paymentStatus = 'failed';
        // Store error info
        if (!reservation.rawSource) reservation.rawSource = {};
        reservation.rawSource.paymentError = transaction_error_desc;
      } else if (auth_status === '0002') {
        // Pending
        paymentTransaction.status = 'pending';
        reservation.paymentStatus = 'pending';
      } else if (auth_status === '0398') {
        // User cancelled
        paymentTransaction.status = 'cancelled';
        reservation.status = 'cancelled';
        reservation.paymentStatus = 'cancelled';
      } else {
        // Unknown status
        paymentTransaction.status = 'pending';
        reservation.paymentStatus = 'pending';
      }

      await paymentTransaction.save();
      await reservation.save();

      console.log("Payment Status:", paymentTransaction.status);
      console.log("Reservation Status:", reservation.status);
      console.log("================================\n");

      // Send email notifications for successful payments
      if (paymentTransaction.status === 'success') {
        console.log(`📧 Sending confirmation emails to ${reservation.email}...`);
        // Send emails asynchronously (don't wait for completion)
        sendReservationSuccessEmails(reservation, paymentTransaction)
          .then(() => console.log('✅ Emails sent successfully'))
          .catch(err => console.error('❌ Email sending failed:', err.message));
      }

      // Redirect based on status (Angular uses hash routing)
      if (paymentTransaction.status === 'success') {
        return res.redirect(`${process.env.FRONTEND_URL}/#/booking-status?bookingId=${bookingId}`);
      } else if (paymentTransaction.status === 'pending') {
        return res.redirect(`${process.env.FRONTEND_URL}/#/booking-status?bookingId=${bookingId}&status=pending`);
      } else {
        return res.redirect(`${process.env.FRONTEND_URL}/#/booking-status?bookingId=${bookingId}&status=failed&error=${transaction_error_desc || 'payment_failed'}`);
      }
    } else {
      console.error("Payment transaction not found");
      return res.redirect(`${process.env.FRONTEND_URL}/booking-failed?error=transaction_not_found`);
    }

  } catch (err) {
    console.error("handlePaymentCallback Error:", err);
    return res.redirect(`${process.env.FRONTEND_URL}/booking-failed?error=callback_error`);
  }
};
