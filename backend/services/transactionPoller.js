import { retrieveTransaction } from './retrieveTransaction.js';
import Reservation from '../models/reservationModel.js';
import PaymentTransaction from '../models/paymentTransactionModel.js';

// Store active polling intervals
const activePolls = new Map();

/**
 * Start polling for a transaction status
 * Checks every 5 minutes for 15 minutes (3 checks total)
 */
export function startTransactionPolling(bookingId, bdOrderId, mercid, authToken = null) {
  // Don't start if already polling
  if (activePolls.has(bookingId)) {
    console.log(`⏭️ Already polling for booking: ${bookingId}`);
    return;
  }

  console.log(`🔄 Starting transaction polling for booking: ${bookingId}`);
  console.log(`   Order ID (bookingId): ${bookingId}`);
  console.log(`   BD Order ID: ${bdOrderId}`);
  console.log(`   Will check every 5 minutes for 15 minutes`);

  let checkCount = 0;
  const maxChecks = 3; // 3 checks over 15 minutes
  const intervalMinutes = 5;

  // Poll immediately on start - pass bookingId (orderid) not bdOrderId
  pollTransaction(bookingId, bookingId, mercid, authToken, checkCount);


  // Set up interval for subsequent checks
  const intervalId = setInterval(async () => {
    checkCount++;
    
    if (checkCount >= maxChecks) {
      console.log(`⏹️ Stopping polling for ${bookingId} - max checks reached`);
      stopTransactionPolling(bookingId);
      return;
    }

    // Pass bookingId (orderid) not bdOrderId
    await pollTransaction(bookingId, bookingId, mercid, authToken, checkCount);
  }, intervalMinutes * 60 * 1000); // Convert minutes to milliseconds

  // Store interval ID
  activePolls.set(bookingId, intervalId);
}

/**
 * Stop polling for a transaction
 */
export function stopTransactionPolling(bookingId) {
  const intervalId = activePolls.get(bookingId);
  if (intervalId) {
    clearInterval(intervalId);
    activePolls.delete(bookingId);
    console.log(`✅ Stopped polling for booking: ${bookingId}`);
  }
}

/**
 * Perform a single poll check
 */
async function pollTransaction(bookingId, orderid, mercid, authToken, checkNumber) {
  console.log(`\n📊 Poll Check #${checkNumber + 1} for booking: ${bookingId}`);
  console.log(`   Time: ${new Date().toISOString()}`);

  try {
    // Retrieve transaction from BillDesk using orderid (bookingId)
    const result = await retrieveTransaction(orderid, mercid, authToken);

    if (!result.success) {
      console.log(`❌ Failed to retrieve transaction: ${result.error}`);
      return;
    }

    console.log(`✅ Transaction retrieved successfully`);
    console.log(`   Response:`, JSON.stringify(result.data, null, 2));

    // TODO: Parse response and update reservation status
    // For now, just log the response to understand the structure

  } catch (error) {
    console.error(`❌ Error polling transaction:`, error.message);
  }
}

/**
 * Get all active polling bookings
 */
export function getActivePolls() {
  return Array.from(activePolls.keys());
}
