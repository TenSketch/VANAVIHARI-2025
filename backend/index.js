import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import userRouter from './routes/userRoutes.js'
import resortRouter from './routes/resortRoutes.js'
import cottageTypeRouter from './routes/cottageTypeRoutes.js'
import roomRouter from './routes/roomRoutes.js'
import amenityRouter from './routes/amenityRoutes.js'
import reservationRouter from './routes/reservationRoutes.js'
import logRouter from './routes/logRoutes.js'
import paymentRouter from './routes/paymentRoutes.js'
import adminAuth from './middlewares/adminAuth.js'
import reportsRouter from './routes/reportsRoute.js'
import tentSpotRouter from './routes/tentSpotRoutes.js'
import touristSpotRouter from './routes/touristSpotRoutes.js'
import tentTypeRouter from './routes/tentTypeRoutes.js'
import tentRouter from './routes/tentRoutes.js'
import tentReservationRouter from './routes/tentReservationRoutes.js'
import { expirePendingReservations } from './controllers/reservationController.js'
import { expirePendingTentReservations } from './controllers/tentReservationController.js'

//App config
const app = express()
const port = process.env.PORT || 5000
connectDB()

// Run expiry check every minute
setInterval(async () => {
  await expirePendingReservations()
  await expirePendingTentReservations()
}, 60000) // 60000ms = 1 minute

// Run once on startup
expirePendingReservations()
expirePendingTentReservations()


//middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // Add this for form data

// CORS: allow configured origins plus local dev defaults to unblock Angular/Vite
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
    'http://localhost:4200',
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(new Error('Not allowed by CORS'))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    exposedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials: true
}))

// Preflight handler for CORS (for all routes)
app.options(/.*/, cors())


//api-end points
app.use('/api/user', userRouter)
app.use('/api/resorts', resortRouter)
app.use('/api/cottage-types', cottageTypeRouter)
app.use('/api/rooms', roomRouter)
app.use('/api/amenities', amenityRouter)
app.use('/api/reservations', reservationRouter)
app.use('/api/logs', logRouter)
app.use('/api/payment', paymentRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/tent-spots', tentSpotRouter)
app.use('/api/touristspots', touristSpotRouter)
app.use('/api/tent-types', tentTypeRouter)
app.use('/api/tents', tentRouter)
app.use('/api/tent-reservations', tentReservationRouter)

// ensure tmp folder is served (used temporarily by multer before upload to cloudinary)
import path from 'path'
app.use('/tmp', express.static(path.join(process.cwd(), 'tmp')))

// sample protected admin route
app.get('/api/admin/me', adminAuth, (req, res) => {
    res.json({ admin: req.admin })
})


app.get('/', (req, res)=>{
    res.send("Vanaavihari API Working")
})



app.listen(port, ()=> console.log('Server started on PORT : '+ port))