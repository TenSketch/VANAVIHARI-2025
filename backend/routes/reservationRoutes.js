import express from 'express'
import { createReservation, getReservations, updateReservation } from '../controllers/reservationController.js'

const router = express.Router()

router.post('/', createReservation)
router.get('/', getReservations)
router.patch('/:id', updateReservation)

export default router
