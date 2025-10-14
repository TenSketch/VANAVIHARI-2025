import express from 'express'
import multer from 'multer'
import { createCottageType, listCottageTypes, getCottageType, updateCottageType, toggleDisableCottageType } from '../controllers/cottageTypeController.js'
import requirePermission from '../middlewares/requirePermission.js'

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'tmp/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage })

// accept up to 6 images named 'images'
// admin edits required for changes
router.post('/add', requirePermission('canEdit'), upload.array('images', 6), createCottageType)
router.get('/', listCottageTypes)
router.get('/:id', getCottageType)
router.put('/:id', requirePermission('canEdit'), updateCottageType)
router.patch('/:id/disable', requirePermission('canDisable'), toggleDisableCottageType)

export default router
