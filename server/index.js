import express from "express"
import dotenv from "dotenv"
dotenv.config()
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import connectDB from "./config/connectDB.js"
import userRouter from "./route/user.route.js"
const app = express()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
app.use(morgan()) 
app.use(express.json())
app.use(cookieParser())
app.use(helmet({
  crossOriginResourcePolicy: false
}))

// Port
const PORT = process.env.PORT || 8080

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Server is running" })
})

app.use('/api/user', userRouter)

// Connect to DB and then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`)
  })
})
