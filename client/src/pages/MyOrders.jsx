import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import NoData from '../components/NoData'
import { DisplayPriceInRupees } from '../utils/DisplayPricelnRupees'
import isAdmin from '../utils/isAdmin'
import UserOrders from '../components/UserOrders'
import AdminOrders from '../components/AdminOrders'

const MyOrders = () => {
  const orders = useSelector(state => state.orders.order)
  const user = useSelector(state => state.user)

  if (isAdmin(user.role)) {
    return <AdminOrders orders={orders} />
  }

  return <UserOrders orders={orders} />
}

export default MyOrders
