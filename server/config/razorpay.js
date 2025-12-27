// RAZORPAY CONFIGURATION
// Replaced Stripe with Razorpay for payment processing
import Razorpay from "razorpay";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

export default razorpayInstance;
