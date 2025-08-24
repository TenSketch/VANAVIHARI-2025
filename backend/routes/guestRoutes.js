import express from 'express'
import multer from 'multer'
import path from 'path'
import { createGuest, listGuests, updateGuest } from '../controllers/guestController.js'

const router = express.Router()

// multer store in tmp folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'tmp')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage })

router.post('/', upload.single('profileImage'), createGuest)
router.get('/', listGuests)
router.patch('/:id', upload.single('profileImage'), updateGuest)

export default router
