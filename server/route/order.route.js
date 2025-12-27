import { Router } from 'express'
import auth from '../middleware/auth.js'
import { CashOnDeliveryOrderController
    , getOrderDetailsController, paymentController, verifyPaymentController, webhookRazorpay 
} from '../controllers/order.controller.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post('/checkout',auth,paymentController)
// RAZORPAY: Verify payment signature and create order
orderRouter.post('/verify-payment',auth,verifyPaymentController)
// RAZORPAY: Webhook for async payment notifications (optional)
orderRouter.post('/razorpay-webhook',webhookRazorpay)
orderRouter.get("/order-list",auth,getOrderDetailsController)

export default orderRouter