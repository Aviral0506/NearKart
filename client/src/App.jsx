import React, { useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartMobileLink from "./components/CartMobile";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserDetails } from "./store/userSlice";
import fetchUserDetails from './utils/fetchUserDetails';
import GlobalProvider from "./provider/GlobalProvider";
const App = () => {
  const dispatch = useDispatch();
  const fetchUser = async () => {
    const userData = await fetchUserDetails()
    dispatch(setUserDetails(userData.data));
    // console.log("Fetched user data:", userData);
  }
    
  useEffect(() => {
    fetchUser();
  }, []);
  return (
    // Make the whole page a flex column, min height = screen
    <GlobalProvider>

    <div className="flex flex-col min-h-screen">
      {/* Header always at top */}
      <Header />

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
