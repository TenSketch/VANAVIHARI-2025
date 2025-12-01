import express from 'express';
import {
  createTentReservation,
  getAllTentReservations,
  getTentReservationById,
  getTentReservationByBookingId,
  updateTentReservation,
  updatePaymentStatus,
  cancelTentReservation,
  deleteTentReservation,
} from '../controllers/tentReservationController.js';
import requirePermission from '../middlewares/requirePermission.js';

const tentReservationRouter = express.Router();

// Public routes
tentReservationRouter.post('/', createTentReservation);
tentReservationRouter.get('/booking/:bookingId', getTentReservationByBookingId);

// Protected routes (require admin authentication and permissions)
tentReservationRouter.get('/', requirePermission('canView'), getAllTentReservations);
tentReservationRouter.get('/:id', requirePermission('canView'), getTentReservationById);
tentReservationRouter.put('/:id', requirePermission('canEdit'), updateTentReservation);
tentReservationRouter.patch('/:id/payment', updatePaymentStatus);
tentReservationRouter.patch('/:id/cancel', requirePermission('canEdit'), cancelTentReservation);
tentReservationRouter.delete('/:id', requirePermission('canEdit'), deleteTentReservation);

export default tentReservationRouter;
