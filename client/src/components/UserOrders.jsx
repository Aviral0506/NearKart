import React, { useState, useMemo } from 'react'
import NoData from './NoData'
import { DisplayPriceInRupees } from '../utils/DisplayPricelnRupees'
import { FiTruck, FiCheck, FiX, FiCalendar, FiMapPin, FiCreditCard, FiPackage } from 'react-icons/fi'

const UserOrders = ({ orders }) => {
  const [filterStatus, setFilterStatus] = useState('all') // all, active, completed
  const [selectedOrder, setSelectedOrder] = useState(null) // For modal

  // Group orders by orderId first, then by date
  const groupedAndFilteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return {}

    // Filter by status
    const filtered = orders.filter(order => {
      if (filterStatus === 'all') return true
      if (filterStatus === 'active') return order.payment_status === 'PAID'
      if (filterStatus === 'completed') return order.payment_status === 'DELIVERED' || order.payment_status === 'COMPLETED'
      return true
    })

    console.log('[UserOrders] Filtered orders:', filtered.length)

    // Group by orderId first
    const ordersByOrderId = {}
    filtered.forEach(order => {
      const orderIdKey = order.orderId
      if (!ordersByOrderId[orderIdKey]) {
        ordersByOrderId[orderIdKey] = []
      }
      ordersByOrderId[orderIdKey].push(order)
    })

    console.log('[UserOrders] Orders by OrderId:', Object.keys(ordersByOrderId).length, 'groups')
    Object.keys(ordersByOrderId).forEach(orderId => {
      console.log(`  OrderId: ${orderId}, Items: ${ordersByOrderId[orderId].length}`)
    })

    // Then group by date
    const grouped = {}
    Object.entries(ordersByOrderId).forEach(([orderId, orderItems]) => {
      const date = new Date(orderItems[0].createdAt)
      const dateKey = date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(orderItems)
    })

    // Sort dates in descending order (latest first)
    const sortedGroups = {}
    Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .forEach(key => {
        sortedGroups[key] = grouped[key]
      })

    return sortedGroups
  }, [orders, filterStatus])

  const getStatusBadge = (paymentStatus) => {
    const statusMap = {
      'PAID': { label: 'Active', color: 'bg-blue-100 text-blue-700', icon: FiTruck },
      'COMPLETED': { label: 'Completed', color: 'bg-green-100 text-green-700', icon: FiCheck },
      'DELIVERED': { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: FiCheck },
      'CASH ON DELIVERY': { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: FiTruck },
      'PENDING': { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: FiTruck },
    }
    return statusMap[paymentStatus] || { label: paymentStatus, color: 'bg-gray-100 text-gray-700', icon: FiTruck }
  }

  const noFilteredOrders = Object.keys(groupedAndFilteredOrders).length === 0

  // Helper function to calculate estimated delivery date
  const getEstimatedDelivery = (createdAt, paymentStatus) => {
    const date = new Date(createdAt)
    if (paymentStatus === 'DELIVERED' || paymentStatus === 'COMPLETED') {
      return 'Delivered'
    }
    date.setDate(date.getDate() + 5) // 5 days for delivery estimate
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Modal Component
  const OrderDetailModal = ({ orderGroup, firstOrder, onClose }) => {
    const orderTotal = orderGroup.reduce((sum, order) => sum + (order.totalAmt || 0), 0)
    const statusInfo = getStatusBadge(firstOrder.payment_status)
    const createdDate = new Date(firstOrder.createdAt)
    const estimatedDelivery = getEstimatedDelivery(firstOrder.createdAt, firstOrder.payment_status)

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
          {/* Modal Header */}
          <div className='sticky top-0 bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 flex justify-between items-center'>
            <div>
              <h2 className='text-2xl font-bold'>Order Details</h2>
              <p className='text-green-100'>Order ID: {firstOrder?.orderId}</p>
            </div>
            <button
              onClick={onClose}
              className='bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition'
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Modal Content */}
          <div className='p-6 space-y-6'>
            {/* Status Section */}
            <div className='bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border-2 border-green-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 font-semibold mb-2'>Order Status</p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${statusInfo.color}`}>
                    <statusInfo.icon size={18} />
                    {statusInfo.label}
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-gray-600 font-semibold mb-2'>Order Date & Time</p>
                  <p className='text-lg font-bold text-gray-800'>
                    {createdDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className='text-sm text-gray-600'>
                    {createdDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className='border-l-4 border-green-500 pl-4 py-2'>
              <h3 className='font-bold text-gray-800 mb-4'>Order Timeline</h3>
              <div className='space-y-4'>
                <div className='flex gap-4'>
                  <div className='flex flex-col items-center'>
                    <div className='w-4 h-4 bg-green-500 rounded-full'></div>
                    <div className='w-1 h-12 bg-green-300 my-1'></div>
                  </div>
                  <div>
                    <p className='font-semibold text-gray-800'>Order Placed</p>
                    <p className='text-sm text-gray-600'>
                      {createdDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>
                <div className='flex gap-4'>
                  <div className='flex flex-col items-center'>
                    <div className={`w-4 h-4 rounded-full ${firstOrder.payment_status === 'PAID' || firstOrder.payment_status === 'COMPLETED' || firstOrder.payment_status === 'DELIVERED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`w-1 h-12 my-1 ${firstOrder.payment_status === 'COMPLETED' || firstOrder.payment_status === 'DELIVERED' ? 'bg-green-300' : 'bg-gray-300'}`}></div>
                  </div>
                  <div>
                    <p className='font-semibold text-gray-800'>Payment Confirmed</p>
                    <p className='text-sm text-gray-600'>{firstOrder.payment_status === 'CASH ON DELIVERY' ? 'Pay on Delivery' : 'Payment processed'}</p>
                  </div>
                </div>
                <div className='flex gap-4'>
                  <div className='flex flex-col items-center'>
                    <div className={`w-4 h-4 rounded-full ${firstOrder.payment_status === 'DELIVERED' ? 'bg-green-500' : firstOrder.payment_status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div>
                    <p className='font-semibold text-gray-800'>Estimated Delivery</p>
                    <p className='text-sm text-gray-600'>{estimatedDelivery}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Summary */}
            <div>
              <h3 className='font-bold text-gray-800 mb-4 flex items-center gap-2'>
                <FiPackage className='text-green-600' />
                Items Ordered ({orderGroup.length})
              </h3>
              <div className='space-y-4'>
                {orderGroup.map((order, itemIndex) => (
                  <div key={order._id + itemIndex} className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                    <div className='flex gap-4'>
                      <img
                        src={order.product_details.image[0]}
                        alt={order.product_details.name}
                        className='w-16 h-16 object-cover rounded-lg'
                      />
                      <div className='flex-grow'>
                        <p className='font-semibold text-gray-800'>{order.product_details.name}</p>
                        <p className='text-xs text-gray-600 mt-1'>Product ID: {order.product_details._id}</p>
                        <div className='grid grid-cols-3 gap-3 mt-2 text-xs'>
                          <div>
                            <p className='text-gray-600 font-semibold'>Price</p>
                            <p className='font-bold text-gray-800'>{DisplayPriceInRupees(order.price || 0)}</p>
                          </div>
                          <div>
                            <p className='text-gray-600 font-semibold'>Quantity</p>
                            <p className='font-bold text-gray-800'>{order.quantity || 1}</p>
                          </div>
                          <div>
                            <p className='text-gray-600 font-semibold'>Total</p>
                            <p className='font-bold text-green-600'>{DisplayPriceInRupees(order.totalAmt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Information */}
            <div className='bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500'>
              <h3 className='font-bold text-gray-800 mb-3 flex items-center gap-2'>
                <FiCreditCard className='text-blue-600' />
                Payment Information
              </h3>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Subtotal ({orderGroup.length} items)</span>
                  <span className='font-semibold text-gray-800'>{DisplayPriceInRupees(orderGroup.reduce((sum, order) => sum + (order.subTotalAmt || 0), 0))}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Discount</span>
                  <span className='font-semibold text-green-600'>-{DisplayPriceInRupees(0)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Shipping</span>
                  <span className='font-semibold text-gray-800'>Free</span>
                </div>
                <div className='border-t border-blue-200 pt-2 mt-2 flex justify-between font-bold text-lg'>
                  <span className='text-gray-800'>Order Total</span>
                  <span className='text-green-600'>{DisplayPriceInRupees(orderTotal)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className='font-bold text-gray-800 mb-3 flex items-center gap-2'>
                <FiCreditCard className='text-green-600' />
                Payment Method
              </h3>
              <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                <p className='font-semibold text-gray-800'>
                  {firstOrder.payment_status === 'CASH ON DELIVERY' ? 'Cash on Delivery (COD)' : 'Online Payment (Razorpay)'}
                </p>
                <p className='text-xs text-gray-600 mt-2'>
                  {firstOrder.payment_status === 'CASH ON DELIVERY' 
                    ? 'Pay when your order arrives at your doorstep'
                    : 'Payment has been processed securely'}
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className='bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3'>
            <button
              onClick={onClose}
              className='flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold'
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-blue-50 min-h-screen p-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='bg-white shadow-md p-4 rounded-lg mb-6'>
          <h1 className='text-2xl font-semibold text-gray-800 mb-4'>My Orders</h1>
          
          {/* Filter Buttons */}
          <div className='flex gap-3 flex-wrap'>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                filterStatus === 'all'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                filterStatus === 'active'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Active Orders
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                filterStatus === 'completed'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Completed Orders
            </button>
          </div>
        </div>

        {/* Orders */}
        {noFilteredOrders ? (
          <NoData />
        ) : (
          Object.entries(groupedAndFilteredOrders).map(([date, dateOrders]) => (
            <div key={date} className='mb-8'>
              {/* Date Header */}
              <div className='sticky top-0 z-10 bg-white px-4 py-2 rounded-lg shadow-sm mb-4 border-l-4 border-green-600'>
                <h2 className='text-lg font-semibold text-gray-800'>{date}</h2>
              </div>

              {/* Orders for this date */}
              <div className='grid gap-4'>
                {dateOrders.map((orderGroup, index) => {
                  // orderGroup is an array of orders with the same orderId
                  const firstOrder = orderGroup[0]
                  const statusInfo = getStatusBadge(firstOrder.payment_status)
                  const StatusIcon = statusInfo.icon
                  
                  // Calculate total for all products in this order
                  const orderTotal = orderGroup.reduce((sum, order) => sum + (order.totalAmt || 0), 0)

                  return (
                    <div
                      key={firstOrder.orderId + index}
                      className='bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden'
                    >
                      {/* Order Header */}
                      <div className='bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b border-gray-200'>
                        <div className='flex justify-between items-start gap-4 flex-wrap'>
                          <div>
                            <p className='text-sm text-gray-600'>Order ID</p>
                            <p className='font-semibold text-gray-800'>{firstOrder?.orderId}</p>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-full font-semibold ${statusInfo.color}`}>
                            <StatusIcon size={16} />
                            {statusInfo.label}
                          </div>
                        </div>
                      </div>

                      {/* Order Items - List all products */}
                      <div className='p-4 space-y-4'>
                        {orderGroup.map((order, itemIndex) => (
                          <div key={order._id + itemIndex} className='border-b border-gray-200 pb-4 last:border-b-0 last:pb-0'>
                            <div className='flex gap-4'>
                              {/* Product Image */}
                              <div className='flex-shrink-0'>
                                <img
                                  src={order.product_details.image[0]}
                                  alt={order.product_details.name}
                                  className='w-20 h-20 object-cover rounded-lg shadow-sm'
                                />
                              </div>

                              {/* Product Details */}
                              <div className='flex-grow'>
                                <p className='font-semibold text-gray-800 line-clamp-2'>
                                  {order.product_details.name}
                                </p>
                                <div className='grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs'>
                                  <div>
                                    <p className='text-gray-600 font-semibold'>UNIT PRICE</p>
                                    <p className='font-semibold text-gray-800'>
                                      {DisplayPriceInRupees(order.price || 0)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className='text-gray-600 font-semibold'>QTY</p>
                                    <p className='font-semibold text-gray-800'>{order.quantity || 1}</p>
                                  </div>
                                  <div>
                                    <p className='text-gray-600 font-semibold'>SUBTOTAL</p>
                                    <p className='font-semibold text-gray-800'>
                                      {DisplayPriceInRupees(order.subTotalAmt || 0)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className='text-gray-600 font-semibold'>AMOUNT</p>
                                    <p className='font-bold text-green-600'>
                                      {DisplayPriceInRupees(order.totalAmt)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className='bg-gradient-to-r from-green-50 to-blue-50 px-4 py-4 border-t-2 border-green-200'>
                        <div className='flex justify-between items-center'>
                          <div>
                            <p className='text-gray-600 text-sm'>Total Items: <span className='font-semibold'>{orderGroup.length}</span></p>
                            <p className='text-gray-600 text-sm'>Ordered on {new Date(firstOrder.createdAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</p>
                          </div>
                          <div className='text-right'>
                            <p className='text-gray-600 text-sm'>Order Total</p>
                            <p className='text-2xl font-bold text-green-600'>{DisplayPriceInRupees(orderTotal)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Footer */}
                      <div className='bg-gray-50 px-4 py-3 border-t border-gray-200'>
                        <button 
                          onClick={() => setSelectedOrder({ orderGroup, firstOrder })}
                          className='w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold'
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          orderGroup={selectedOrder.orderGroup}
          firstOrder={selectedOrder.firstOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}

export default UserOrders
