import React, { useState, useEffect, useMemo } from 'react'
import NoData from './NoData'
import { DisplayPriceInRupees } from '../utils/DisplayPricelnRupees'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { FiPhone, FiMapPin, FiCalendar, FiUser, FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import toast from 'react-hot-toast'

const AdminOrders = ({ orders }) => {
  const [adminOrders, setAdminOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  
  // Date picker state - default to today
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }
  const [selectedDate, setSelectedDate] = useState(getTodayDate())

  // Fetch orders with customer details populated
  const fetchAdminOrders = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getOrderList,
      })

      if (response.data.success) {
        setAdminOrders(response.data.data || [])
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminOrders()
  }, [])

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId)
      const response = await Axios({
        ...SummaryApi.updateOrderStatus,
        data: {
          orderId: orderId,
          newStatus: newStatus
        }
      })

      if (response.data.success) {
        // Update local state with new orders
        const updatedOrdersData = response.data.data
        setAdminOrders(prevOrders => {
          const newOrders = [...prevOrders]
          updatedOrdersData.forEach(updatedOrder => {
            const index = newOrders.findIndex(o => o._id === updatedOrder._id)
            if (index !== -1) {
              newOrders[index] = updatedOrder
            }
          })
          return newOrders
        })
        toast.success(`Order marked as ${newStatus}`)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // Helper function to get date key for comparison
  const getDateKey = (date) => {
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  // Filter and group orders by selected date
  const filteredOrdersForDate = useMemo(() => {
    if (!adminOrders || adminOrders.length === 0) return {}

    // Filter by selected date
    const ordersOnDate = adminOrders.filter(order => {
      const orderDateKey = getDateKey(order.createdAt)
      return orderDateKey === selectedDate
    })

    // Filter by status
    const filtered = ordersOnDate.filter(order => {
      const matchesStatus = filterStatus === 'all' || order.payment_status === filterStatus
      const matchesSearch = 
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.mobile?.toString().includes(searchTerm) ||
        order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesStatus && matchesSearch
    })

    // Group by orderId
    const ordersByOrderId = {}
    filtered.forEach(order => {
      const orderIdKey = order.orderId
      if (!ordersByOrderId[orderIdKey]) {
        ordersByOrderId[orderIdKey] = []
      }
      ordersByOrderId[orderIdKey].push(order)
    })

    return ordersByOrderId
  }, [adminOrders, selectedDate, filterStatus, searchTerm])

  // Get available dates from orders
  const availableDates = useMemo(() => {
    const dates = new Set()
    adminOrders.forEach(order => {
      dates.add(getDateKey(order.createdAt))
    })
    return Array.from(dates).sort().reverse() // Latest first
  }, [adminOrders])

  // Navigate to previous/next date with orders
  const navigateDate = (direction) => {
    const currentIndex = availableDates.indexOf(selectedDate)
    if (direction === 'prev' && currentIndex < availableDates.length - 1) {
      setSelectedDate(availableDates[currentIndex + 1])
    } else if (direction === 'next' && currentIndex > 0) {
      setSelectedDate(availableDates[currentIndex - 1])
    }
  }

  // Format date for display
  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    })
  }

  const getStatusColor = (status) => {
    const statusColors = {
      'PAID': 'bg-blue-100 text-blue-800 border-blue-300',
      'DELIVERED': 'bg-green-100 text-green-800 border-green-300',
      'COMPLETED': 'bg-green-100 text-green-800 border-green-300',
      'CASH ON DELIVERY': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'PENDING': 'bg-orange-100 text-orange-800 border-orange-300',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-300',
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const noFilteredOrders = Object.keys(filteredOrdersForDate).length === 0

  return (
    <div className='bg-blue-50 min-h-screen p-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='bg-white shadow-md p-6 rounded-lg mb-6'>
          <h1 className='text-3xl font-bold text-gray-800 mb-6'>Orders Management</h1>
          
          {/* Date Picker Section */}
          <div className='bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6 border border-blue-200'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='flex-1'>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>Select Date</label>
                <div className='flex gap-2 items-center'>
                  <button
                    onClick={() => navigateDate('prev')}
                    disabled={availableDates.indexOf(selectedDate) >= availableDates.length - 1}
                    className='p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition'
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  
                  <input
                    type='date'
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  
                  <button
                    onClick={() => navigateDate('next')}
                    disabled={availableDates.indexOf(selectedDate) <= 0}
                    className='p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition'
                  >
                    <FiChevronRight size={20} />
                  </button>

                  <button
                    onClick={() => setSelectedDate(getTodayDate())}
                    className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold whitespace-nowrap'
                  >
                    Today
                  </button>
                </div>
              </div>
              
              <div className='text-right'>
                <p className='text-sm text-gray-600 mb-1'>Showing orders for</p>
                <p className='text-lg font-bold text-blue-600 flex items-center justify-end gap-2'>
                  <FiCalendar size={18} />
                  {formatDateDisplay(selectedDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className='space-y-4'>
            {/* Status Filter */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Filter by Status</label>
              <div className='flex gap-3 flex-wrap'>
                {['all', 'PAID', 'DELIVERED', 'CASH ON DELIVERY', 'PENDING'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-full font-semibold transition ${
                      filterStatus === status
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {status === 'all' ? 'All Orders' : status}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Search Orders</label>
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search by Order ID, Customer Name, Phone, or Email...'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
              />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {!loading && adminOrders.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            <div className='bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500'>
              <p className='text-gray-600 text-sm font-semibold'>Total Orders (All Time)</p>
              <p className='text-3xl font-bold text-blue-600 mt-1'>{adminOrders.length}</p>
            </div>
            <div className='bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500'>
              <p className='text-gray-600 text-sm font-semibold'>Orders Today</p>
              <p className='text-3xl font-bold text-green-600 mt-1'>{Object.keys(filteredOrdersForDate).length}</p>
            </div>
            <div className='bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500'>
              <p className='text-gray-600 text-sm font-semibold'>Pending Delivery</p>
              <p className='text-3xl font-bold text-yellow-600 mt-1'>
                {adminOrders.filter(o => o.payment_status === 'PAID' || o.payment_status === 'CASH ON DELIVERY').length}
              </p>
            </div>
            <div className='bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-600'>
              <p className='text-gray-600 text-sm font-semibold'>Delivered Today</p>
              <p className='text-3xl font-bold text-green-700 mt-1'>
                {Object.keys(filteredOrdersForDate).filter(orderId => {
                  const orderGroup = filteredOrdersForDate[orderId]
                  return orderGroup[0].payment_status === 'DELIVERED'
                }).length}
              </p>
            </div>
          </div>
        )}

        {/* Orders */}
        {loading ? (
          <div className='text-center py-12'>
            <p className='text-gray-600 text-lg'>Loading orders...</p>
          </div>
        ) : noFilteredOrders ? (
          <NoData />
        ) : (
          <div className='bg-white rounded-lg shadow-md overflow-hidden'>
            {/* Date Header with Order Count */}
            <div className='bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between'>
              <h2 className='text-lg font-bold flex items-center gap-2'>
                <FiCalendar size={20} />
                {formatDateDisplay(selectedDate)}
              </h2>
              <span className='bg-white text-gray-800 px-4 py-1 rounded-full font-bold'>
                {Object.keys(filteredOrdersForDate).length} order{Object.keys(filteredOrdersForDate).length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Orders Grid */}
            <div className='p-6 space-y-4'>
                {Object.entries(filteredOrdersForDate).map(([orderId, orderGroup], index) => {
                  // orderGroup is an array of orders with the same orderId
                  const firstOrder = orderGroup[0]
                  const orderTotal = orderGroup.reduce((sum, order) => sum + (order.totalAmt || 0), 0)

                  return (
                    <div
                      key={firstOrder.orderId + index}
                      className='bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border-l-4 border-green-500'
                    >
                      {/* Order Header */}
                      <div className='bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b border-gray-200'>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                          <div>
                            <p className='text-xs text-gray-600 font-semibold uppercase'>Order ID</p>
                            <p className='font-bold text-gray-800 text-lg'>{firstOrder?.orderId}</p>
                          </div>
                          <div>
                            <p className='text-xs text-gray-600 font-semibold uppercase'>Payment Status</p>
                            <p className={`font-semibold px-3 py-1 rounded-full text-sm inline-block mt-1 border ${getStatusColor(firstOrder.payment_status)}`}>
                              {firstOrder.payment_status}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs text-gray-600 font-semibold uppercase'>Payment Method</p>
                            <p className='font-semibold text-gray-800'>{firstOrder.paymentId ? 'Online' : 'COD'}</p>
                          </div>
                          <div>
                            <p className='text-xs text-gray-600 font-semibold uppercase'>Order Date</p>
                            <p className='font-semibold text-gray-800'>{new Date(firstOrder.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                        </div>
                      </div>

                      {/* Customer and Order Info */}
                      <div className='p-4 border-b border-gray-200'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                          {/* Customer Details */}
                          <div>
                            <h3 className='text-sm font-bold text-gray-800 mb-3 flex items-center gap-2'>
                              <FiUser className='text-green-600' />
                              Customer Details
                            </h3>
                            <div className='space-y-2 bg-gray-50 p-3 rounded-lg'>
                              <p className='text-gray-700'>
                                <span className='font-semibold'>Name:</span> {firstOrder.userId?.name || 'N/A'}
                              </p>
                              <p className='text-gray-700 flex items-center gap-2'>
                                <FiPhone size={16} className='text-green-600' />
                                <span className='font-semibold'>Phone:</span> {firstOrder.userId?.mobile || 'N/A'}
                              </p>
                              <p className='text-gray-700'>
                                <span className='font-semibold'>Email:</span> {firstOrder.userId?.email || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Delivery Address */}
                          <div>
                            <h3 className='text-sm font-bold text-gray-800 mb-3 flex items-center gap-2'>
                              <FiMapPin className='text-green-600' />
                              Delivery Address
                            </h3>
                            <div className='space-y-1 bg-gray-50 p-3 rounded-lg text-sm text-gray-700'>
                              <p className='font-semibold'>{firstOrder.delivery_address?.address_line}</p>
                              {firstOrder.delivery_address?.address_line2 && (
                                <p>{firstOrder.delivery_address.address_line2}</p>
                              )}
                              <p>{firstOrder.delivery_address?.city}, {firstOrder.delivery_address?.state} {firstOrder.delivery_address?.pincode}</p>
                              <p>{firstOrder.delivery_address?.country}</p>
                              <p className='font-semibold text-green-600 mt-2'>📱 {firstOrder.delivery_address?.mobile}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Products List */}
                      <div className='p-4 bg-gray-50 border-t border-gray-200'>
                        <h3 className='text-sm font-bold text-gray-800 mb-4'>Products ({orderGroup.length})</h3>
                        <div className='space-y-4'>
                          {orderGroup.map((order, itemIndex) => (
                            <div key={order._id + itemIndex} className='bg-white p-4 rounded-lg border border-gray-200'>
                              <div className='flex gap-4'>
                                {/* Product Image */}
                                <div className='flex-shrink-0'>
                                  <img
                                    src={order.product_details?.image?.[0]}
                                    alt={order.product_details?.name}
                                    className='w-20 h-20 object-cover rounded-lg shadow-sm border border-gray-300'
                                  />
                                </div>

                                {/* Product Info */}
                                <div className='flex-grow'>
                                  <p className='font-semibold text-gray-800 line-clamp-2 mb-3'>
                                    {order.product_details?.name}
                                  </p>
                                  <div className='grid grid-cols-2 md:grid-cols-4 gap-2 text-xs'>
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
                      </div>

                      {/* Order Summary Footer */}
                      <div className='bg-gradient-to-r from-green-50 to-blue-50 px-4 py-4 border-t-2 border-green-200'>
                        <div className='flex justify-between items-center flex-wrap gap-4'>
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

                      {/* Action Buttons - Update Status */}
                      <div className='bg-gray-50 px-4 py-4 border-t border-gray-200'>
                        <div className='flex gap-2 flex-wrap'>
                          {firstOrder.payment_status !== 'DELIVERED' && firstOrder.payment_status !== 'COMPLETED' && firstOrder.payment_status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(firstOrder.orderId, 'DELIVERED')}
                              disabled={updatingOrderId === firstOrder.orderId}
                              className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                              <FiCheck size={18} />
                              {updatingOrderId === firstOrder.orderId ? 'Updating...' : 'Mark as Delivered'}
                            </button>
                          )}
                          
                          {firstOrder.payment_status !== 'CANCELLED' && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleUpdateOrderStatus(firstOrder.orderId, e.target.value)
                                  e.target.value = ''
                                }
                              }}
                              disabled={updatingOrderId === firstOrder.orderId}
                              className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                              <option value=''>Change Status</option>
                              {firstOrder.payment_status !== 'PAID' && <option value='PAID'>Mark as Paid</option>}
                              {firstOrder.payment_status !== 'DELIVERED' && <option value='DELIVERED'>Mark as Delivered</option>}
                              {firstOrder.payment_status !== 'COMPLETED' && <option value='COMPLETED'>Mark as Completed</option>}
                              <option value='CANCELLED'>Cancel Order</option>
                            </select>
                          )}

                          {firstOrder.payment_status === 'CANCELLED' && (
                            <div className='px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold'>
                              Order Cancelled
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
      </div>
    </div>
  )
}

export default AdminOrders
