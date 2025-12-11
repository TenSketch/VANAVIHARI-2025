import TentReservation from '../models/tentReservationModel.js';
import Tent from '../models/tentModel.js';
import TentSpot from '../models/tentSpotModel.js';

// Generate unique booking ID
const generateBookingId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `TENT-${timestamp}-${random}`.toUpperCase();
};

// Create a new tent reservation
export const createTentReservation = async (req, res) => {
  try {
    const {
      tentSpotId,
      tentIds,
      checkinDate,
      checkoutDate,
      guests,
      fullName,
      phone,
      email,
      address1,
      address2,
      city,
      state,
      postalCode,
      country,
    } = req.body;

    // Validation
    if (!tentSpotId || !tentIds || !tentIds.length || !checkinDate || !checkoutDate || !fullName || !phone || !email) {
      return res.status(400).json({
        success: false,
        error: 'All required fields must be provided'
      });
    }

    // Verify tent spot exists
    const tentSpot = await TentSpot.findById(tentSpotId);
    if (!tentSpot || tentSpot.isDisabled) {
      return res.status(404).json({
        success: false,
        error: 'Tent spot not found or disabled'
      });
    }

    // Verify all tents exist and belong to the tent spot
    const tents = await Tent.find({
      _id: { $in: tentIds },
      tentSpot: tentSpotId,
      isDisabled: false
    });

    if (tents.length !== tentIds.length) {
      return res.status(400).json({
        success: false,
        error: 'One or more tents are invalid or not available'
      });
    }

    // Check if tents are available for the requested dates
    const overlappingReservations = await TentReservation.find({
      tentSpot: tentSpotId,
      status: { $in: ['pending', 'confirmed'] },
      tents: { $in: tentIds },
      $or: [
        {
          checkinDate: { $gte: new Date(checkinDate), $lt: new Date(checkoutDate) }
        },
        {
          checkoutDate: { $gt: new Date(checkinDate), $lte: new Date(checkoutDate) }
        },
        {
          checkinDate: { $lte: new Date(checkinDate) },
          checkoutDate: { $gte: new Date(checkoutDate) }
        }
      ]
    });

    if (overlappingReservations.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'One or more tents are already booked for the selected dates'
      });
    }

    // Calculate total payable
    const totalPayable = tents.reduce((sum, tent) => sum + tent.rate, 0);

    // Generate booking ID
    const bookingId = generateBookingId();

    // Set expiry time (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Create reservation
    const reservation = new TentReservation({
      tentSpot: tentSpotId,
      tents: tentIds,
      checkinDate: new Date(checkinDate),
      checkoutDate: new Date(checkoutDate),
      guests: guests || tents.reduce((sum, tent) => sum + tent.noOfGuests, 0),
      bookingId,
      totalPayable,
      fullName,
      phone,
      email,
      address1,
      address2,
      city,
      state,
      postalCode,
      country,
      expiresAt,
      status: 'pending',
      paymentStatus: 'unpaid'
    });

    await reservation.save();

    // Populate references
    await reservation.populate('tentSpot tents');

    res.status(201).json({
      success: true,
      message: 'Tent reservation created successfully',
      reservation
    });
  } catch (error) {
    console.error('Error creating tent reservation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create tent reservation'
    });
  }
};

// Get all tent reservations
export const getAllTentReservations = async (req, res) => {
  try {
    const { status, tentSpotId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (tentSpotId) query.tentSpot = tentSpotId;

    const reservations = await TentReservation.find(query)
      .populate('tentSpot', 'spotName location')
      .populate('tents', 'tentId tentType rate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reservations
    });
  } catch (error) {
    console.error('Error fetching tent reservations:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch tent reservations'
    });
  }
};

// Get tent reservation by ID
export const getTentReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservation = await TentReservation.findById(id)
      .populate('tentSpot', 'spotName location contactPerson contactNo')
      .populate('tents', 'tentId tentType rate noOfGuests');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Tent reservation not found'
      });
    }

    res.status(200).json({
      success: true,
      reservation
    });
  } catch (error) {
    console.error('Error fetching tent reservation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch tent reservation'
    });
  }
};

// Get tent reservation by booking ID
export const getTentReservationByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const reservation = await TentReservation.findOne({ bookingId })
      .populate('tentSpot', 'spotName location contactPerson contactNo')
      .populate('tents', 'tentId tentType rate noOfGuests');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Tent reservation not found'
      });
    }

    res.status(200).json({
      success: true,
      reservation
    });
  } catch (error) {
    console.error('Error fetching tent reservation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch tent reservation'
    });
  }
};

// Update tent reservation
export const updateTentReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating certain fields
    delete updateData.bookingId;
    delete updateData.createdAt;

    const reservation = await TentReservation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('tentSpot tents');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Tent reservation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tent reservation updated successfully',
      reservation
    });
  } catch (error) {
    console.error('Error updating tent reservation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update tent reservation'
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentTransactionId, rawSource } = req.body;

    const updateData = { paymentStatus };
    if (paymentTransactionId) updateData.paymentTransactionId = paymentTransactionId;
    if (rawSource) updateData.rawSource = rawSource;

    // If payment is successful, confirm the reservation
    if (paymentStatus === 'paid') {
      updateData.status = 'confirmed';
      updateData.expiresAt = null; // Remove expiry
    }

    const reservation = await TentReservation.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('tentSpot tents');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Tent reservation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      reservation
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update payment status'
    });
  }
};

// Cancel tent reservation
export const cancelTentReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundPercentage } = req.body;

    const reservation = await TentReservation.findById(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Tent reservation not found'
      });
    }

    reservation.status = 'cancelled';
    if (refundPercentage !== undefined) {
      reservation.refundPercentage = refundPercentage;
    }

    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Tent reservation cancelled successfully',
      reservation
    });
  } catch (error) {
    console.error('Error cancelling tent reservation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel tent reservation'
    });
  }
};

// Delete tent reservation (hard delete)
export const deleteTentReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await TentReservation.findByIdAndDelete(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Tent reservation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tent reservation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tent reservation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete tent reservation'
    });
  }
};

// Expire pending tent reservations (called by cron job)
export const expirePendingTentReservations = async () => {
  try {
    const now = new Date();
    
    const result = await TentReservation.updateMany(
      {
        status: 'pending',
        paymentStatus: { $ne: 'paid' },
        expiresAt: { $lte: now }
      },
      {
        $set: { status: 'cancelled' }
      }
    );

    console.log(`Expired ${result.modifiedCount} pending tent reservations`);
    return result;
  } catch (error) {
    console.error('Error expiring tent reservations:', error);
    throw error;
  }
};
