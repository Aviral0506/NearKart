import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Cancel = () => {
  const location = useLocation()
  
  console.log('[Cancel] Page loaded')
  console.log('[Cancel] Location state:', location?.state)
  
  return (
    <div className='m-2 w-full max-w-md bg-red-200 p-4 py-5 rounded mx-auto flex flex-col justify-center items-center gap-5'>
        <p className='text-red-800 font-bold text-lg text-center'>{location?.state?.text || 'Order Cancelled'}</p>
        <Link to="/" className="border border-red-900 text-red-900 hover:bg-red-900 hover:text-white transition-all px-4 py-1">Go To Home</Link>
    </div>
  )
}

export default Cancel
