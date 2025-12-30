import React, { useState } from "react";
import { FaRegEyeSlash, FaRegEye, FaBolt, FaBagShopping, FaTruck } from "react-icons/fa6";
import toast, { Toaster } from "react-hot-toast";
import Axios from "../utils/Axios";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = Object.values(data).every((el) => el);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.password !== data.confirmPassword) {
      toast.error("Password and confirm password must be the same");
      return;
    }

    try {
      setLoading(true);

      const response = await Axios.post("/api/user/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      console.log("Backend response:", response.data);

      if (response.data.success) {
        toast.success(response.data.message);
        setData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        // Redirect after short delay to let toast show
        setTimeout(() => navigate("/login"), 1000);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Axios error:", error.response?.data || error.message);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

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
        {/* Register Card - Ultra Minimal & Classy */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          {/* Welcome header - Centered and minimal */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">Create Account</h1>
            <p className="text-sm text-gray-600 mb-3">Join NearKart for super-fast delivery</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-purple-300 rounded-full"></div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  autoFocus
                  className="w-full p-3.5 bg-white border border-gray-200 rounded-lg outline-none transition-all duration-200
                           focus:border-purple-500 focus:ring-2 focus:ring-purple-100
                           hover:border-gray-300"
                  name="name"
                  value={data.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
                <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

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

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full p-3.5 bg-white border border-gray-200 rounded-lg outline-none transition-all duration-200
                           focus:border-purple-500 focus:ring-2 focus:ring-purple-100
                           hover:border-gray-300"
                  name="password"
                  value={data.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
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
                  placeholder="••••••••"
                />
                <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <FaRegEye className="w-4 h-4" /> : <FaRegEyeSlash className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full py-3.5 px-6 rounded-lg font-medium text-white transition-all duration-200 relative overflow-hidden
                ${isFormValid && !loading 
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-md active:scale-[0.98]" 
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <FaBolt className="mr-2.5" />
                    Sign Up
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
              <span className="px-2 bg-white text-gray-400">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-3 px-6 rounded-lg border border-gray-200 text-gray-700 font-medium hover:border-purple-200 hover:bg-purple-50 transition-all duration-200"
            >
              <FaBagShopping className="mr-2.5 text-gray-400" />
              Login to Your Account
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

        {/* Footer text - Minimal */}
        <p className="text-center text-gray-400 text-xs mt-4">
          By creating an account, you agree to our Terms & Privacy
        </p>
      </div>
    </section>
  );
};

export default Register;