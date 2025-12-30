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
        const { list_items, totalAmt, addressId, orderId } = request.body 

        console.log('[CashOnDelivery] Received request with:')
        console.log('  userId:', userId)
        console.log('  addressId:', addressId)
        console.log('  totalAmt:', totalAmt)
        console.log('  orderId (from frontend):', orderId)
        console.log('  list_items count:', list_items?.length || 0)
        console.log('  First item:', list_items?.[0])

        // Use orderId sent from frontend (prevents duplicate key errors)
        // Frontend generates unique orderId: `ORD-${Date.now()}-${random string}`
        if (!orderId) {
            console.error('[CashOnDelivery] ERROR: orderId not provided from frontend')
            return response.status(400).json({
                message: "Invalid order - orderId missing",
                error: true,
                success: false
            })
        }

        // CHECK if order with this orderId already exists (idempotent operation)
        console.log('[CashOnDelivery] Checking if orderId already exists:', orderId)
        const existingOrder = await OrderModel.findOne({ orderId: orderId })
        
        if (existingOrder) {
            console.log('[CashOnDelivery] ⚠️  Order with this orderId already exists!')
            console.log('[CashOnDelivery] Existing order ID:', existingOrder._id)
            console.log('[CashOnDelivery] Returning existing order (idempotent response)')
            
            // Return success with existing order (treat duplicate submission as success)
            return response.json({
                message: "Order already placed successfully",
                error: false,
                success: true,
                data: [existingOrder],  // Return as array to match insertMany response
                isDuplicate: true
            })
        }

        const payload = list_items.map(el => {
            // Calculate unit price (totalAmt / quantity)
            const unitPrice = el.quantity ? el.totalAmt / el.quantity : el.totalAmt
            const itemSubTotal = el.quantity * unitPrice
            
            // Handle both cases: productId can be string or object
            const productId = typeof el.productId === 'string' ? el.productId : el.productId._id
            
            return({
                userId : userId,
                orderId : orderId,  // Use same orderId for all items
                productId : productId, 
                product_details : {
                    name : el.productId.name || el.product_details?.name,
                    image : el.productId.image || el.product_details?.image
                } ,
                quantity : el.quantity || 1,
                price : unitPrice,
                paymentId : "",
                payment_status : "CASH ON DELIVERY",
                delivery_address : addressId ,
                subTotalAmt : itemSubTotal,
                totalAmt : el.totalAmt,
            })
        })

        console.log('[CashOnDelivery] Payload created:', payload.length, 'items')

        const generatedOrder = await OrderModel.insertMany(payload)

        console.log('[CashOnDelivery] ✅ Orders created:', generatedOrder.length)

        // Always clear the cart after successful order placement
        console.log('[CashOnDelivery] Clearing cart for user:', userId)
        const removeCartItems = await CartProductModel.deleteMany({ userId : userId })
        const updateInUser = await UserModel.updateOne({ _id : userId }, { shopping_cart : []})

        console.log('[CashOnDelivery] ✅ Cart cleared')
        console.log('[CashOnDelivery] Removed', removeCartItems.deletedCount, 'items from cart')

        return response.json({
            message : "Order successfully",
            error : false,
            success : true,
            data : generatedOrder
        })

    } catch (error) {
        console.error('[CashOnDelivery] ❌ Error:', error.message)
        console.error('[CashOnDelivery] Error Code:', error.code)
        
        // Special handling for E11000 duplicate key errors
        if (error.code === 11000) {
            console.error('[CashOnDelivery] E11000 Error - Duplicate key detected')
            console.error('[CashOnDelivery] Duplicate value:', error.keyValue)
            
            // Try to fetch the existing order
            try {
                const orderId = error.keyValue?.orderId
                if (orderId) {
                    const existingOrder = await OrderModel.findOne({ orderId: orderId })
                    if (existingOrder) {
                        console.log('[CashOnDelivery] ✅ Found existing order, returning it')
                        
                        // Clear the cart anyway
                        await CartProductModel.deleteMany({ userId : request.userId })
                        await UserModel.updateOne({ _id : request.userId }, { shopping_cart : []})
                        
                        return response.json({
                            message: "Order already placed successfully",
                            error: false,
                            success: true,
                            data: [existingOrder],
                            isDuplicate: true
                        })
                    }
                }
            } catch (fetchErr) {
                console.error('[CashOnDelivery] Error handling duplicate:', fetchErr.message)
            }
        }
        
        console.error('[CashOnDelivery] Stack:', error.stack)
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
    // Generate ONE orderId for all items in this order
    const newOrderId = `ORD-${new mongoose.Types.ObjectId()}`

    const payload = cartItems.map(el => {
      // Calculate unit price (totalAmt / quantity)
      const unitPrice = el.quantity ? el.totalAmt / el.quantity : el.totalAmt
      const itemSubTotal = el.quantity * unitPrice
      
      // Handle both cases: productId can be string or object
      const productId = typeof el.productId === 'string' ? el.productId : el.productId._id
      
      return {
        userId: userId,
        orderId: newOrderId,  // Use same orderId for all items
        productId: productId,
        product_details: {
          name: el.productId.name || el.product_details?.name,
          image: el.productId.image || el.product_details?.image
        },
        quantity: el.quantity || 1,
        price: unitPrice,
        paymentId: paymentId,
        payment_status: "PAID",
        delivery_address: addressId,
        subTotalAmt: itemSubTotal,
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

// Get all orders for admin with customer and address details populated
export async function getAdminOrdersController(request, response) {
    try {
        const orders = await OrderModel.find()
            .populate({
                path: 'userId',
                select: 'name email mobile avatar'
            })
            .populate({
                path: 'delivery_address',
                select: 'address_line address_line2 city state country pincode mobile address_type'
            })
            .sort({ createdAt: -1 })

        return response.json({
            message: "All orders with customer details",
            data: orders,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Update order status (admin only)
export async function updateOrderStatusController(request, response) {
    try {
        const { orderId, newStatus } = request.body

        if (!orderId || !newStatus) {
            return response.status(400).json({
                message: "orderId and newStatus are required",
                error: true,
                success: false
            })
        }

        // Validate status values
        const validStatuses = ['CASH ON DELIVERY', 'PAID', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'PENDING']
        if (!validStatuses.includes(newStatus)) {
            return response.status(400).json({
                message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
                error: true,
                success: false
            })
        }

        // Update all orders with this orderId
        const updatedOrders = await OrderModel.updateMany(
            { orderId: orderId },
            { $set: { payment_status: newStatus } },
            { new: true }
        )

        if (updatedOrders.modifiedCount === 0) {
            return response.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            })
        }

        // Fetch and return updated orders
        const orders = await OrderModel.find({ orderId: orderId })
            .populate({
                path: 'userId',
                select: 'name email mobile avatar'
            })
            .populate({
                path: 'delivery_address',
                select: 'address_line address_line2 city state country pincode mobile address_type'
            })

        return response.json({
            message: `Order status updated to ${newStatus}`,
            data: orders,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
