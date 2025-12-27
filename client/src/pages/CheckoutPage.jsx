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
const CheckoutPage = () => {

  const { notDiscountTotalPrice, totalPrice ,totalQty, fetchCartItem, fetchAddress } = useGlobalContext()
  const [openAddress, setOpenAddress] = useState(false)
  const addressList = useSelector(state => state.address?.addressList) || []
  const [selectAddress, setSelectAddress] = useState(0)
  const cartItemsList = useSelector(state => state.cartItem?.cart) || []
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch addresses when component mounts
    if (fetchAddress) {
      fetchAddress()
    }
  }, [])

  const handleCloseAddress = () => {
    setOpenAddress(false)
    // Refresh address list when modal closes
    if (fetchAddress) {
      fetchAddress()
    }
  }

  const handleCashOnDelivery = async() => {
      try {
          if (!addressList[selectAddress]?._id) {
            toast.error("Please select a valid address")
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
                            <input id={"address" + index} type='radio' value={index} onChange={(e) => setSelectAddress(e.target.value)} name='address' defaultChecked={index === 0} />
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
            <button className='py-2 px-4 bg-green-600 hover:bg-green-700 rounded text-white font-semibold'>Online Payment</button>

            <button className='py-2 px-4 border-2 border-green-600 font-semibold text-green-600 hover:bg-green-600 hover:text-white' onClick={handleCashOnDelivery}>Cash on Delivery</button>
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
