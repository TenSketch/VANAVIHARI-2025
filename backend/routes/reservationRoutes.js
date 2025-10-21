import express from 'express'
import { createReservation, getReservations, updateReservation, getNextSerial } from '../controllers/reservationController.js'
import requirePermission from '../middlewares/requirePermission.js'

const router = express.Router()

// Get next serial number for booking ID generation
router.get('/next-serial', getNextSerial)
// creating reservations requires canAddReservations
router.post('/', requirePermission('canAddReservations'), createReservation)
router.get('/', getReservations)
// updates require editing rights (canEdit)
router.patch('/:id', requirePermission('canEdit'), updateReservation)

export default router
