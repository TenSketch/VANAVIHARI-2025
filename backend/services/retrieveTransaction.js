import axios from 'axios';

/**
 * Retrieve transaction status from BillDesk
 * @param {string} bdOrderId - BillDesk order ID
 * @param {string} mercid - Merchant ID
 * @returns {Promise<Object>} Transaction details
 */
export async function retrieveTransaction(bdOrderId, mercid) {
  try {
    const traceId = "TID" + Math.random().toString(36).slice(2, 14).toUpperCase();
    const timestamp = Date.now().toString();

    // Request body as per BillDesk API
    const requestBody = {
      mercid: mercid || process.env.BILLDESK_MERCID
    };

    const url = `https://uat1.billdesk.com/u2/payments/ve1_2/transactions/get/${bdOrderId}`;

    console.log('\n=== RETRIEVE TRANSACTION REQUEST ===');
    console.log('URL:', url);
    console.log('BD-TraceID:', traceId);
    console.log('BD-Timestamp:', timestamp);
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/jose',
        'BD-Traceid': traceId,
        'BD-Timestamp': timestamp
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('====================================\n');

    return {
      success: true,
      data: response.data,
      traceId,
      timestamp
    };

  } catch (error) {
    console.error('\n❌ RETRIEVE TRANSACTION ERROR ===');
    console.error('Error Message:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    console.error('====================================\n');

    return {
      success: false,
      error: error.message,
      response: error.response?.data || null
    };
  }
}
