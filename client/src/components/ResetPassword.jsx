import React, { useEffect, useState } from 'react'
import { FaRegEye, FaRegEyeSlash, FaBolt, FaBagShopping, FaTruck } from 'react-icons/fa6'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SummaryApi from '../common/SummaryApi'
import toast, { Toaster } from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'

const ResetPassword = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [data,setData] = useState({
    email : "",
    newPassword : "",
    confirmPassword : ""
  })
  const [showPassword,setShowPassword] = useState(false)
  const [showConfirmPassword,setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const valideValue = Object.values(data).every(el => el)

  useEffect(()=>{
    if(!(location?.state?.data?.success)){
        navigate("/")
    }

    if(location?.state?.email){
        setData((preve)=>{
            return{
                ...preve,
                email : location?.state?.email
            }
        })
    }
  },[])

  const handleChange = (e) => {
        const { name, value } = e.target

        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        })
    }

  console.log("data reset password",data)

  const handleSubmit = async(e)=>{
    e.preventDefault()

    ///optional 
    if(data.newPassword !== data.confirmPassword){
        toast.error("New password and confirm password must be same.")
        return
    }

    try {
        setLoading(true)
        const response = await Axios({
            ...SummaryApi.resetPassword, //change
            data : data
        })
        
        if(response.data.error){
            toast.error(response.data.message)
        }

        if(response.data.success){
            toast.success(response.data.message)
            navigate("/login")
            setData({
                email : "",
                newPassword : "",
                confirmPassword : ""
            })
            
        }

    } catch (error) {
        AxiosToastError(error)
    } finally {
        setLoading(false)
    }
  }

  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          className: 'font-sans',
          style: {
            background: '#fff',
            color: '#000',
            borderRadius: '8px',
          },
        }}
      />
      
      {/* Subtle decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -right-16 w-48 h-48 bg-gradient-to-br from-purple-100 to-transparent rounded-full opacity-20"></div>
        <div className="absolute bottom-1/4 -left-16 w-48 h-48 bg-gradient-to-tr from-green-100 to-transparent rounded-full opacity-20"></div>
      </div>

      <div className="relative w-full max-w-sm z-10">
        {/* Reset Password Card - Ultra Minimal & Classy */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          {/* Header - Centered and minimal */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">Reset Password</h1>
            <p className="text-sm text-gray-600 mb-3">Create a new secure password</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-purple-300 rounded-full"></div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field (read-only) */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  readOnly
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-600 cursor-not-allowed"
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                  placeholder="Email will auto-fill"
                />
                <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  className="w-full p-3.5 bg-white border border-gray-200 rounded-lg outline-none transition-all duration-200
                           focus:border-purple-500 focus:ring-2 focus:ring-purple-100
                           hover:border-gray-300"
                  name="newPassword"
                  value={data.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                />
                <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(preve => !preve)}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FaRegEye className="w-4 h-4" /> : <FaRegEyeSlash className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  className="w-full p-3.5 bg-white border border-gray-200 rounded-lg outline-none transition-all duration-200
                           focus:border-purple-500 focus:ring-2 focus:ring-purple-100
                           hover:border-gray-300"
                  name="confirmPassword"
                  value={data.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
                <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(preve => !preve)}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <FaRegEye className="w-4 h-4" /> : <FaRegEyeSlash className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Reset Password Button */}
            <button
              type="submit"
              disabled={!valideValue || loading}
              className={`w-full py-3.5 px-6 rounded-lg font-medium text-white transition-all duration-200 relative overflow-hidden
                ${valideValue && !loading 
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-md active:scale-[0.98]" 
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Resetting...
                  </>
                ) : (
                  <>
                    <FaBolt className="mr-2.5" />
                    Update Password
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-400">Remember your password?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-3 px-6 rounded-lg border border-gray-200 text-gray-700 font-medium hover:border-purple-200 hover:bg-purple-50 transition-all duration-200"
            >
              <FaBagShopping className="mr-2.5 text-gray-400" />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Quick commerce badges - Very minimal */}
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-lg">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
              <FaTruck className="text-purple-600 text-xs" />
            </div>
            <span className="text-xs text-gray-500">Delivery in minutes</span>
          </div>
        </div>

      </div>
    </section>
  )
}

export default ResetPassword