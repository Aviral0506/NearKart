import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [data, setData] = useState({
        email: "",
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target

        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        })
    }

    const valideValue = Object.values(data).every(el => el)


    const handleSubmit = async(e)=>{
        e.preventDefault()
        
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.forgot_password,
                data : data
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                navigate("/verification-otp",{
                  state : data
                })
                setData({
                    email : "",
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
                    background: '#7c3aed',
                    color: '#fff',
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
                {/* Forgot Password Card - Ultra Minimal & Classy */}
                <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                    {/* Header - Centered and minimal */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Forgot Password</h1>
                        <p className="text-sm text-gray-600 mb-3">Enter your email to receive reset instructions</p>
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-purple-300 rounded-full"></div>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full p-3.5 bg-white border border-gray-200 rounded-lg outline-none transition-all duration-200
                                            focus:border-purple-500 focus:ring-2 focus:ring-purple-100
                                            hover:border-gray-300"
                                    name="email"
                                    value={data.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                />
                                <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Information text */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                            <p className="text-xs text-blue-700">
                                <span className="font-medium">Note:</span> We'll send a verification OTP to this email address to reset your password.
                            </p>
                        </div>

                        {/* Send OTP Button */}
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
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Send Verification OTP
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
                            <svg className="w-4 h-4 mr-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Back to Login
                        </Link>
                    </div>
                </div>

                {/* Quick commerce badges - Very minimal */}
                <div className="mt-6 flex justify-center">
                    <div className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-lg">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xs text-gray-500">Secure verification process</span>
                    </div>
                </div>

                {/* Security note - Minimal */}
                <p className="text-center text-gray-400 text-xs mt-4">
                    We never share your email with third parties
                </p>
            </div>
        </section>
    )
}

export default ForgotPassword