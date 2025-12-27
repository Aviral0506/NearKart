import React, { useState, useEffect } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { useSelector } from 'react-redux'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { DisplayPriceInRupees } from '../utils/DisplayPricelnRupees'
import AddAddress from '../components/AddAddress'

// RAZORPAY: Load Razorpay SDK with improved error handling
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if (window.Razorpay) {
      console.log('Razorpay SDK already loaded')
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    
    script.onload = () => {
      console.log('Razorpay SDK loaded successfully')
      resolve(true)
    }
    
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK from CDN')
      // Try alternative CDN as fallback
      const fallbackScript = document.createElement('script')
      fallbackScript.src = 'https://checkout.razorpay.com/v1/checkout.js?retry=1'
      fallbackScript.async = true
      
      fallbackScript.onload = () => {
        console.log('Razorpay SDK loaded from fallback URL')
        resolve(true)
      }
      
      fallbackScript.onerror = () => {
        console.error('Failed to load Razorpay SDK from all sources')
        resolve(false)
      }
      
      document.body.appendChild(fallbackScript)
    }
    
    document.body.appendChild(script)
  })
}

const CheckoutPage = () => {

  const { notDiscountTotalPrice, totalPrice ,totalQty, fetchCartItem, fetchAddress } = useGlobalContext()
  const [openAddress, setOpenAddress] = useState(false)
  const addressList = useSelector(state => state.address?.addressList) || []
  const [selectAddress, setSelectAddress] = useState(0)
  const cartItemsList = useSelector(state => state.cartItem?.cart) || []
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Fetch addresses when component mounts
    if (fetchAddress) {
      fetchAddress()
    }
  }, [])

  useEffect(() => {
    // Auto-select first active address when addresses load
    if (addressList && addressList.length > 0) {
      const activeAddressIndex = addressList.findIndex(addr => addr.status === true)
      if (activeAddressIndex !== -1) {
        setSelectAddress(activeAddressIndex)
      } else if (addressList[0]) {
        // If no active address, select the first one
        setSelectAddress(0)
      }
    }
  }, [addressList])

  const handleCloseAddress = () => {
    setOpenAddress(false)
    // Refresh address list when modal closes
    if (fetchAddress) {
      fetchAddress()
    }
  }

  const isAddressValid = () => {
    const selectedAddr = addressList[selectAddress]
    if (!selectedAddr) {
      toast.error("Please select an address")
      return false
    }
    if (!selectedAddr?._id) {
      toast.error("Invalid address selected")
      return false
    }
    if (!selectedAddr.address_line) {
      toast.error("Selected address is incomplete")
      return false
    }
    return true
  }

  const handleCashOnDelivery = async() => {
      try {
          if (!isAddressValid()) {
            return
          }

          const response = await Axios({
            ...SummaryApi.CashOnDeliveryOrder,
            data : {
              list_items : cartItemsList,
              addressId : addressList[selectAddress]?._id,
              subTotalAmt : totalPrice,
              totalAmt :  totalPrice,
            }
          })

          const { data : responseData } = response

          if(responseData.success){
              toast.success(responseData.message)
              if(fetchCartItem){
                fetchCartItem()
              }
              navigate('/success',{
                state : {
                  text : "Order"
                }
              })
          }

      } catch (error) {
        AxiosToastError(error)
      }
  }

  // RAZORPAY: Handle online payment with Razorpay
  const handleRazorpayPayment = async() => {
    try {
      if (!isAddressValid()) {
        return
      }

      setIsLoading(true)
      console.log('Initiating Razorpay payment...')

      // Step 1: Create Razorpay order from backend
      const orderResponse = await Axios({
        ...SummaryApi.payment_url,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
        }
      })

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create order')
      }

      const { order_id, amount, currency, key_id, user_email } = orderResponse.data
      console.log('Razorpay order created:', order_id)

      // Step 2: Load Razorpay script
      console.log('Loading Razorpay SDK...')
      const isScriptLoaded = await loadRazorpayScript()
      
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection and try again.')
      }

      // Step 3: Verify Razorpay instance is available
      if (!window.Razorpay) {
        throw new Error('Razorpay is not available. Please refresh the page and try again.')
      }

      console.log('Opening Razorpay payment modal...')

      // Step 4: Open Razorpay payment modal
      const options = {
        key: key_id, // Razorpay test API key
        amount: amount,
        currency: currency,
        name: 'NearKart',
        description: 'Order Payment',
        order_id: order_id,
        handler: async (response) => {
          try {
            console.log('Payment response received:', response)
            
            // Step 5: Verify payment on backend
            const verifyResponse = await Axios({
              ...SummaryApi.verifyPayment,
              data: {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                addressId: addressList[selectAddress]?._id,
                // userId will come from auth middleware
                cartItems: cartItemsList
              }
            })

            console.log('Verify response:', verifyResponse.data)

            if (verifyResponse.data.success) {
              console.log('Payment verified successfully')
              toast.success('Payment successful! Order placed.')
              
              // RAZORPAY: Clear cart after successful payment
              try {
                if (fetchCartItem) {
                  console.log('Clearing cart from frontend...')
                  await fetchCartItem()
                  console.log('Cart cleared successfully')
                }
              } catch (cartError) {
                console.error('Error clearing cart:', cartError)
                // Don't stop navigation even if cart clear fails
              }
              
              // RAZORPAY: Add small delay to ensure state updates before navigation
              console.log('Waiting before navigation...')
              setTimeout(() => {
                console.log('Navigating to success page...')
                setIsLoading(false)
                navigate('/success', {
                  state: {
                    text: 'Order'
                  }
                })
              }, 500)
            } else {
              setIsLoading(false)
              console.error('Payment verification returned false:', verifyResponse.data)
              toast.error(verifyResponse.data.message || 'Payment verification failed')
            }
          } catch (error) {
            setIsLoading(false)
            console.error('Payment verification error:', error)
            console.error('Error details:', error.response?.data || error.message)
            AxiosToastError(error)
            toast.error('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          email: user_email,
          contact: addressList[selectAddress]?.mobile || ''
        },
        theme: {
          color: '#16a34a' // Green color matching your design
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed by user')
            setIsLoading(false)
            // RAZORPAY: Redirect to cancel page when user dismisses payment
            navigate('/cancel', {
              state: {
                text: 'Payment Cancelled'
              }
            })
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (error) {
      console.error('Razorpay payment error:', error)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      AxiosToastError(error)
      
      // Provide specific error messages
      if (error.message.includes('Razorpay')) {
        toast.error(error.message)
      } else {
        toast.error('Failed to initiate payment. Please try again.')
      }
      
      setIsLoading(false)
    }
  }
  return (
    <section className='bg-blue-50'>
      <div className='container mx-auto p-4 flex flex-col lg:flex-row gap-5 justify-between'>
        <div className='w-full'>
          <h3 className='font-semibold'>Choose Your Address</h3>
          <div className='bg-white p-2 grid gap-4'>
            {addressList && addressList.length > 0 ? (
              <>
                {
                  addressList.map((address, index) => {
                    return (
                      <label htmlFor={"address" + index} key={index} className={!address.status ? "hidden" : ""}>
                        <div className='border rounded p-3 flex gap-3 hover:bg-blue-50'>
                          <div>
                            <input id={"address" + index} type='radio' value={index} onChange={(e) => setSelectAddress(Number(e.target.value))} name='address' checked={selectAddress === index} />
                          </div>
                          <div>
                            <p><strong>{address.address_type}</strong></p>
                            <p>{address.address_line}</p>
                            <p>{address.city}</p>
                            <p>{address.state}</p>
                            <p>{address.country} - {address.pincode}</p>
                            <p>{address.mobile}</p>
                          </div>
                        </div>
                      </label>
                    )
                  })
                }
              </>
            ) : (
              <p className='text-gray-500 py-4'>No addresses available. Please add one.</p>
            )}
            <div onClick={() => setOpenAddress(true)} className='h-16 bg-blue-50 border-2 border-dashed flex justify-center items-center cursor-pointer hover:bg-blue-100'>
              + Add New Address
            </div>
          </div>
        </div>
        <div>
          {/* summary */}
          <h3 className='text-lg font-semibold'>Summary</h3>
            <div className='bg-white p-4'>
                <h3 className='font-semibold'>Bill details</h3>
                <div className='flex gap-4 justify-between ml-1'>
                    <p>Items total</p>
                    <p className='flex items-center gap-2'><span className='line-through text-neutral-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span><span>{DisplayPriceInRupees(totalPrice)}</span></p>
                </div>
                <div className='flex gap-4 justify-between ml-1'>
                    <p>Quntity total</p>
                    <p className='flex items-center gap-2'>{totalQty} item</p>
                </div>
                <div className='flex gap-4 justify-between ml-1'>
                    <p>Delivery Charge</p>
                    <p className='flex items-center gap-2'>Free</p>
                </div>
                <div className='font-semibold flex items-center justify-between gap-4'>
                    <p >Grand total</p>
                    <p>{DisplayPriceInRupees(totalPrice)}</p>
                </div>
            </div>
        </div>
          <div className='w-full flex flex-col gap-4'>
            {/* RAZORPAY: Online Payment button */}
            <button 
              onClick={handleRazorpayPayment} 
              disabled={isLoading || !addressList[selectAddress]?._id}
              className='py-2 px-4 bg-green-600 hover:bg-green-700 rounded text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed'>
              {isLoading ? 'Processing...' : 'Online Payment'}
            </button>

            <button 
              disabled={!addressList[selectAddress]?._id}
              className='py-2 px-4 border-2 border-green-600 font-semibold text-green-600 hover:bg-green-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-400 disabled:text-gray-400' 
              onClick={handleCashOnDelivery}>
              Cash on Delivery
            </button>
          </div>

      </div>
      {
        openAddress && (
          <AddAddress close={handleCloseAddress} />
        )
      }
    </section>
  )
}

export default CheckoutPage
