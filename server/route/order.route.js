import { Router } from 'express'
import auth from '../middleware/auth.js'
import { admin } from '../middleware/Admin.js'
import { CashOnDeliveryOrderController
    , getOrderDetailsController, paymentController, verifyPaymentController, webhookRazorpay, getAdminOrdersController, updateOrderStatusController 
} from '../controllers/order.controller.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post('/checkout',auth,paymentController)
// RAZORPAY: Verify payment signature and create order
orderRouter.post('/verify-payment',auth,verifyPaymentController)
// RAZORPAY: Webhook for async payment notifications (optional)
orderRouter.post('/razorpay-webhook',webhookRazorpay)
orderRouter.get("/order-list",auth,getOrderDetailsController)
// Admin: Get all orders with customer details
orderRouter.get("/admin/all-orders",auth,admin,getAdminOrdersController)
// Admin: Update order status
orderRouter.post("/admin/update-order-status",auth,admin,updateOrderStatusController)

export default orderRouter