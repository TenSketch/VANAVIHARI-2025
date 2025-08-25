import express from 'express'
import { createAmenity, listAmenities, updateAmenityStatus, updateAmenity } from '../controllers/amenityController.js'

const router = express.Router()

router.post('/add', createAmenity)
router.get('/', listAmenities)
router.patch('/:id/status', updateAmenityStatus)
router.put('/:id', updateAmenity)

export default router
