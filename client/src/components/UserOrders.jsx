import React, { useState, useMemo } from 'react'
import NoData from './NoData'
import { DisplayPriceInRupees } from '../utils/DisplayPricelnRupees'
import { FiTruck, FiCheck } from 'react-icons/fi'

const UserOrders = ({ orders }) => {
  const [filterStatus, setFilterStatus] = useState('all') // all, active, completed

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
                        <button className='w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold'>
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
    </div>
  )
}

export default UserOrders
