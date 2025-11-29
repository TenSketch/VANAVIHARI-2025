import express from 'express'
import { getDailyOccupancyReport, getDailyOccupancyReportBySlug } from '../controllers/reportsContoller.js'

const router = express.Router()

// Get daily occupancy report by resort ID
router.get('/daily-occupancy/:resortId', getDailyOccupancyReport)

// Get daily occupancy report by resort slug (e.g., 'vanavihari' or 'junglestar')
router.get('/daily-occupancy/slug/:slug', getDailyOccupancyReportBySlug)

export default router
