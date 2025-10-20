import express from 'express'
import multer from 'multer'
import { createRoom, listRooms, listAvailableRooms, updateRoom, getNextRoomId } from '../controllers/roomController.js'
import requirePermission from '../middlewares/requirePermission.js'

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'tmp/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage })

router.post('/add', requirePermission('canEdit'), upload.array('images'), createRoom)
router.get('/', listRooms)
router.get('/available', listAvailableRooms)
router.get('/next-room-id/:resortId', getNextRoomId)
router.put('/:id', requirePermission('canEdit'), upload.array('images'), updateRoom)

export default router
