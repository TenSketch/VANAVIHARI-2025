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
import guestRouter from './routes/guestRoutes.js'
import adminAuth from './middlewares/adminAuth.js'
import tentSpotRouter from './routes/tentSpotRoutes.js'
import tentRouter from './routes/tentRoutes.js'

//App config
const app = express()
const port = process.env.PORT || 5000
connectDB()


//middleware
app.use(express.json())
app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL],
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
app.use('/api/guests', guestRouter)
app.use('/api/tent-spots', tentSpotRouter)
app.use('/api/tent-types', tentRouter)

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