import express from 'express';
import {
  createTentSpot,
  getAllTentSpots,
  getTentSpotById,
  updateTentSpot,
  toggleTentSpotStatus,
  deleteTentSpot,
} from '../controllers/tentSpotController.js';
import requirePermission from '../middlewares/requirePermission.js';

const tentRouter = express.Router();

// Public routes
tentRouter.get('/', getAllTentSpots);
tentRouter.get('/:id', getTentSpotById);

// Protected routes (require admin authentication and permissions)
tentRouter.post('/', requirePermission('canEdit'), createTentSpot);
tentRouter.put('/:id', requirePermission('canEdit'), updateTentSpot);
tentRouter.patch('/:id/toggle-status', requirePermission('canDisable'), toggleTentSpotStatus);
tentRouter.delete('/:id', requirePermission('canEdit'), deleteTentSpot);

export default tentRouter;
