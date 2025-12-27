// STRIPE REMOVED - Replaced with Razorpay payment gateway
import razorpayInstance from "../config/razorpay.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";
import crypto from "crypto";

 export async function CashOnDeliveryOrderController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const payload = list_items.map(el => {
            return({
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : el.productId._id, 
                product_details : {
                    name : el.productId.name,
                    image : el.productId.image
                } ,
                paymentId : "",
                payment_status : "CASH ON DELIVERY",
                delivery_address : addressId ,
                subTotalAmt  : subTotalAmt,
                totalAmt  :  totalAmt,
            })
        })

        const generatedOrder = await OrderModel.insertMany(payload)

        ///remove from the cart
        const removeCartItems = await CartProductModel.deleteMany({ userId : userId })
        const updateInUser = await UserModel.updateOne({ _id : userId }, { shopping_cart : []})

        return response.json({
            message : "Order successfully",
            error : false,
            success : true,
            data : generatedOrder
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}

export async function paymentController(request, response) {
  try {
    const userId = request.userId; // auth middleware
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    const user = await UserModel.findById(userId);

    // RAZORPAY: Create order for payment
    // Razorpay amount is in the smallest currency unit (paise for INR)
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(totalAmt * 100), // Convert to paise
      currency: "INR",
      receipt: `ORD-${new mongoose.Types.ObjectId()}`,
      notes: {
        userId: userId,
        addressId: addressId,
        cartItems: JSON.stringify(list_items.map(item => ({
          productId: item.productId._id,
          name: item.productId.name,
          quantity: item.quantity,
          price: pricewithDiscount(item.productId.price, item.productId.discount)
        })))
      }
    });

    // Return order details to frontend for payment
    return response.status(200).json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_API_KEY,
      user_email: user.email,
      user_id: userId
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}



// RAZORPAY: Verify payment signature and create order
export async function verifyPaymentController(request, response) {
  try {
    const userId = request.userId; // Get from auth middleware
    const { orderId, paymentId, signature, addressId, cartItems } = request.body;

    console.log('[Verify Payment] Received request:', { 
      userId, 
      orderId, 
      paymentId, 
      signature: signature?.substring(0, 10) + '...',
      cartItemsCount: cartItems?.length || 0
    });

    // Verify Razorpay signature for secure payment verification
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET);
    hmac.update(orderId + "|" + paymentId);
    const generated_signature = hmac.digest('hex');

    console.log('[Verify Payment] Signature comparison:');
    console.log('  Generated:', generated_signature);
    console.log('  Received:', signature);
    console.log('  Match:', generated_signature === signature);

    if (generated_signature !== signature) {
      console.log('[Verify Payment] ❌ Signature verification failed');
      return response.status(400).json({
        message: "Payment verification failed - Signature mismatch",
        error: true,
        success: false
      });
    }

    console.log('[Verify Payment] ✅ Signature verified successfully');

    // Payment verified - Create order in database
    const payload = cartItems.map(el => {
      return {
        userId: userId,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: el.productId._id,
        product_details: {
          name: el.productId.name,
          image: el.productId.image
        },
        paymentId: paymentId,
        payment_status: "PAID",
        delivery_address: addressId,
        subTotalAmt: el.subTotalAmt,
        totalAmt: el.totalAmt,
      };
    });

    console.log('[Verify Payment] Creating orders:', payload.length);
    const generatedOrder = await OrderModel.insertMany(payload);
    console.log('[Verify Payment] ✅ Orders created');

    // Remove items from cart after successful payment
    console.log('[Verify Payment] Clearing cart for user:', userId);
    await CartProductModel.deleteMany({ userId: userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });
    console.log('[Verify Payment] ✅ Cart cleared');

    return response.json({
      message: "Order successfully created",
      error: false,
      success: true,
      data: generatedOrder
    });

  } catch (error) {
    console.error('[Verify Payment] ❌ Error:', error.message);
    console.error('[Verify Payment] Stack:', error.stack);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

// STRIPE REMOVED - Replaced with Razorpay webhook handler
// RAZORPAY: Handle Razorpay webhook events (optional - mainly for async payment status updates)
export async function webhookRazorpay(request, response) {
  try {
    const event = request.body;
    
    // For Razorpay, signature verification is typically done on frontend
    // This webhook is optional and can be used for async notifications
    // For this implementation, payment verification is done in verifyPaymentController
    
    console.log("Razorpay webhook event:", event.event);
    
    response.json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);
    response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}



export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId // order id

        const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')

        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
