import express from 'express'
import multer from 'multer'
import { createRoom, listRooms, updateRoom } from '../controllers/roomController.js'

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'tmp/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage })

router.post('/add', upload.array('images'), createRoom)
router.get('/', listRooms)
router.put('/:id', upload.array('images'), updateRoom)

export default router
