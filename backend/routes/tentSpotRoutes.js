import express from 'express'
import multer from 'multer'
import { createTentSpot, listTentSpots, getTentSpot, updateTentSpot, toggleDisableTentSpot } from '../controllers/tentSpotController.js'

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'tmp/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage })

router.post('/add', upload.none(), createTentSpot)
router.get('/', listTentSpots)
router.get('/:id', getTentSpot)
router.put('/:id', updateTentSpot)
router.patch('/:id/disable', toggleDisableTentSpot)

export default router
