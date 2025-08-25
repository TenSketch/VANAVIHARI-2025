import express from 'express'
import multer from 'multer'
import path from 'path'
import { createResort, listResorts, updateResort } from '../controllers/resortController.js'

const router = express.Router()

// Multer setup: store in tmp folder with original extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'tmp/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage })

router.post('/add', upload.single('logo'), createResort)
router.get('/', listResorts)
router.put('/:id', upload.single('logo'), updateResort)

export default router
