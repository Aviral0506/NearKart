import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartMobileLink from "./components/CartMobile";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserDetails } from "./store/userSlice";
import fetchUserDetails from './utils/fetchUserDetails';
import GlobalProvider from "./provider/GlobalProvider";
import { Toaster } from "react-hot-toast";

const App = () => {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  const fetchUser = async () => {
    try {
      // Check if token exists before fetching
      const accessToken = localStorage.getItem("accesstoken");
      
      if (!accessToken) {
        console.log("No access token found, skipping user fetch");
        setIsInitializing(false);
        return;
      }
      
      const userData = await fetchUserDetails();
      if (userData?.data) {
        dispatch(setUserDetails(userData.data));
        console.log("Fetched user data:", userData.data);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      // User will remain logged out, which is fine
    } finally {
      setIsInitializing(false);
    }
  }
    
  useEffect(() => {
    // Initialize immediately without delay to prevent premature redirect
    fetchUser();
  }, []);
  return (
    // Make the whole page a flex column, min height = screen
    <GlobalProvider>
    <Toaster
      position="top-right"
      reverseOrder={false}
      containerClassName="!z-[9999]"
      toastOptions={{
        className: 'font-sans',
        success: {
          duration: 3000,
        },
        error: {
          duration: 3000,
        },
        style: {
          background: '#fff',
          color: '#000',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      }}
    />
    <div className="flex flex-col min-h-screen">
      {/* Header always at top - only render after initial user check */}
      {!isInitializing && <Header />}

      {/* Main content grows and pushes footer down */}
      <main className="flex-grow">
        <Outlet />
      </main>
    
      {/* Footer always at bottom */}
      <Footer />

      {/* Mobile Cart */}
      <CartMobileLink />
    </div>
    </GlobalProvider>
  );
};

export default App;
