import express from 'express'
import { createAmenity, listAmenities } from '../controllers/amenityController.js'

const router = express.Router()

router.post('/add', createAmenity)
router.get('/', listAmenities)

export default router
