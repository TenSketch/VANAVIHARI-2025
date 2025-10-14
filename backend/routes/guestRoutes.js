import express from 'express'
import multer from 'multer'
import path from 'path'
import { createGuest, listGuests, updateGuest } from '../controllers/guestController.js'
import requirePermission from '../middlewares/requirePermission.js'

const router = express.Router()

// multer store in tmp folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'tmp')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage })

// creating guests requires canAddGuests
router.post('/', requirePermission('canAddGuests'), upload.single('profileImage'), createGuest)
router.get('/', listGuests)
// updates require editing rights
router.patch('/:id', requirePermission('canEdit'), upload.single('profileImage'), updateGuest)

export default router
