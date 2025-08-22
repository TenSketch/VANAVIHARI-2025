import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import userRouter from './routes/userRoutes.js'

//App config
const app = express()
const port = process.env.PORT || 4000
connectDB()


//middleware
app.use(express.json())
app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    exposedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials: true
}))

// Preflight handler for CORS (for all routes)
app.options(/.*/, cors())


//api-end points
app.use('/api/user', userRouter)


app.get('/', (req, res)=>{
    res.send("API Working")
})



app.listen(port, ()=> console.log('Server started on PORT : '+ port))