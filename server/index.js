import express from "express"
import dotenv from "dotenv"
dotenv.config()
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import client from "prom-client"
import connectDB from "./config/connectDB.js"
import userRouter from "./route/user.route.js"
import categoryRouter from "./route/category.route.js"  
import uploadRouter from "./route/upload.route.js"
import subCategoryRouter from "./route/subCategory.route.js"
import productRouter from "./route/product.route.js"
import cartRouter from "./route/cart.route.js"
import addressRouter from "./route/address.route.js"
import orderRouter from "./route/order.route.js"
const app = express()

// Prometheus metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

app.use((req, res, next) => {
  res.on('finish', () => {
    // Track API requests to calculate rate and error rate
    if (req.path.startsWith('/api') || req.path === '/') {
      httpRequestCounter.inc({
        method: req.method,
        route: req.route ? req.route.path : req.path,
        status_code: res.statusCode
      });
    }
  });
  next();
});

// Middleware
app.use(cors({
  origin: [
    "https://nearkart.app",
    "https://www.nearkart.app",
    "http://localhost:5173"
  ],
  credentials: true
}))
app.use(morgan()) 
app.use(express.json())
app.use(cookieParser())
app.use(helmet({
  crossOriginResourcePolicy: false
}))

// Port
const PORT = process.env.PORT || 5000

// Routes
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.get("/", (req, res) => {
  res.json({ message: "Server is running" })
})

app.use('/api/user', userRouter)
app.use("/api/category",categoryRouter)
app.use("/api/file",uploadRouter)
app.use("/api/subcategory",subCategoryRouter)
app.use("/api/product", productRouter)
app.use("/api/cart", cartRouter)
app.use("/api/address", addressRouter)
app.use("/api/order", orderRouter)
// Connect to DB and then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`)
  })
})
