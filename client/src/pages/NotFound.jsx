import React from 'react'
import { Link } from 'react-router-dom'
import { FaHome, FaArrowLeft } from 'react-icons/fa'

const NotFound = () => {
  return (
    <section className='w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className='text-center px-4'>
            <div className='mb-8'>
                <h1 className='text-9xl lg:text-[150px] font-bold text-gray-300 mb-2'>404</h1>
                <p className='text-3xl lg:text-4xl font-bold text-gray-800 mb-4'>Page Not Found</p>
                <p className='text-lg text-gray-600 mb-8'>Sorry, the page you're looking for doesn't exist or has been moved.</p>
            </div>

            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Link 
                    to="/" 
                    className='inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors'
                >
                    <FaHome size={20} />
                    <span>Go to Home</span>
                </Link>
                
                <button 
                    onClick={() => window.history.back()} 
                    className='inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors'
                >
                    <FaArrowLeft size={20} />
                    <span>Go Back</span>
                </button>
            </div>

            <div className='mt-12'>
                <p className='text-gray-600 text-sm'>
                    Need help? <Link to="/search" className='text-green-600 hover:text-green-700 font-semibold'>Search for products</Link>
                </p>
            </div>
        </div>
    </section>
  )
}

export default NotFound
