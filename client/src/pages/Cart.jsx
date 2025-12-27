import React from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from "../utils/DisplayPricelnRupees"
import { FaCaretRight } from "react-icons/fa"
import { useSelector, useDispatch } from 'react-redux'
import AddToCartButton from '../components/AddToCartButton'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import imageEmpty from '../assets/empty_cart.webp'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Cart = () => {
    const { notDiscountTotalPrice, totalPrice, totalQty } = useGlobalContext()
    const cartItem = useSelector(state => state.cartItem.cart)
    const user = useSelector(state => state.user)
    const navigate = useNavigate()

    const redirectToCheckoutPage = () => {
        if (user?._id) {
            navigate("/checkout")
            return
        }
        toast("Please Login")
    }

    return (
        <section className='bg-white'>
            <div className='container mx-auto p-4 lg:p-8'>
                <div className='flex items-center gap-3 justify-between mb-8'>
                    <h2 className='font-semibold text-2xl lg:text-3xl'>Your Cart</h2>
                </div>

                <div className='grid lg:grid-cols-3 gap-8'>
                    {/* Cart Items */}
                    <div className='lg:col-span-2'>
                        {
                            cartItem[0] ? (
                                <div className='space-y-4'>
                                    <div className='flex items-center justify-between px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-semibold'>
                                        <p>Your total savings</p>
                                        <p>{DisplayPriceInRupees(notDiscountTotalPrice - totalPrice)}</p>
                                    </div>
                                    <div className='bg-white border border-gray-200 rounded-lg p-4 space-y-4'>
                                        {
                                            cartItem.map((item) => {
                                                return (
                                                    <div key={item?._id} className='flex gap-4 pb-4 border-b last:border-b-0'>
                                                        <div className='w-20 h-20 min-h-20 min-w-20 bg-gray-100 border rounded'>
                                                            <img
                                                                src={item?.productId?.image[0]}
                                                                className='w-full h-full object-scale-down'
                                                            />
                                                        </div>
                                                        <div className='flex-1'>
                                                            <p className='font-medium text-gray-800 line-clamp-2'>{item?.productId?.name}</p>
                                                            <p className='text-sm text-gray-500 mt-1'>{item?.productId?.unit}</p>
                                                            <p className='font-semibold text-gray-900 mt-2'>{DisplayPriceInRupees(pricewithDiscount(item?.productId?.price, item?.productId?.discount))}</p>
                                                        </div>
                                                        <div className='flex items-center'>
                                                            <AddToCartButton data={item?.productId} />
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            ) : (
                                <div className='bg-white border border-gray-200 rounded-lg p-8 flex flex-col justify-center items-center min-h-96'>
                                    <img
                                        src={imageEmpty}
                                        alt='empty'
                                        className='w-32 h-32'
                                    />
                                    <p className='text-gray-500 mt-4'>Your cart is empty</p>
                                </div>
                            )
                        }
                    </div>

                    {/* Bill Summary */}
                    <div className='lg:col-span-1'>
                        {
                            cartItem[0] && (
                                <div className='bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-20'>
                                    <h3 className='font-semibold text-lg mb-4'>Order Summary</h3>
                                    <div className='space-y-3 mb-4'>
                                        <div className='flex justify-between text-sm'>
                                            <p className='text-gray-600'>Items Total</p>
                                            <p className='flex items-center gap-2'>
                                                <span className='line-through text-gray-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span>
                                                <span className='font-semibold'>{DisplayPriceInRupees(totalPrice)}</span>
                                            </p>
                                        </div>
                                        <div className='flex justify-between text-sm'>
                                            <p className='text-gray-600'>Quantity</p>
                                            <p className='font-semibold'>{totalQty} items</p>
                                        </div>
                                        <div className='flex justify-between text-sm'>
                                            <p className='text-gray-600'>Delivery Charge</p>
                                            <p className='font-semibold text-green-600'>Free</p>
                                        </div>
                                    </div>
                                    <div className='border-t pt-4 flex justify-between'>
                                        <p className='font-semibold text-lg'>Grand Total</p>
                                        <p className='font-bold text-lg text-green-600'>{DisplayPriceInRupees(totalPrice)}</p>
                                    </div>
                                    <button
                                        onClick={redirectToCheckoutPage}
                                        className='w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors'
                                    >
                                        <span>Proceed to Checkout</span>
                                        <FaCaretRight />
                                    </button>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Cart
