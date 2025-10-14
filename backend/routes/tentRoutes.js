import express from 'express'
import multer from 'multer'
import { createTentType, listTentTypes, getTentType, updateTentType, toggleDisableTentType } from '../controllers/tentController.js'
import requirePermission from '../middlewares/requirePermission.js'

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'tmp/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage })

// creating/updating tent types requires editing rights
router.post('/add', requirePermission('canEdit'), upload.none(), createTentType)
router.get('/', listTentTypes)
router.get('/:id', getTentType)
router.put('/:id', requirePermission('canEdit'), updateTentType)
// disabling requires canDisable
router.patch('/:id/disable', requirePermission('canDisable'), toggleDisableTentType)

export default router
