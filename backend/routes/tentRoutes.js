import express from 'express'
import multer from 'multer'
import { createTentType, listTentTypes, getTentType, updateTentType, toggleDisableTentType } from '../controllers/tentController.js'

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'tmp/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage })

// currently no images expected but keep same interface
router.post('/add', upload.none(), createTentType)
router.get('/', listTentTypes)
router.get('/:id', getTentType)
router.put('/:id', updateTentType)
router.patch('/:id/disable', toggleDisableTentType)

export default router
