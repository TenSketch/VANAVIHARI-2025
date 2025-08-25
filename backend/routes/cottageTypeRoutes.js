import express from 'express'
import multer from 'multer'
import { createCottageType, listCottageTypes, getCottageType, updateCottageType, toggleDisableCottageType } from '../controllers/cottageTypeController.js'

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'tmp/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage })

// accept up to 6 images named 'images'
router.post('/add', upload.array('images', 6), createCottageType)
router.get('/', listCottageTypes)
router.get('/:id', getCottageType)
router.put('/:id', updateCottageType)
router.patch('/:id/disable', toggleDisableCottageType)

export default router
