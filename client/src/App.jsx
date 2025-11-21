import React, { useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserDetails } from "./store/userSlice";
import fetchUserDetails from './utils/fetchUserDetails';
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
    <div className="flex flex-col min-h-screen">
      {/* Header always at top */}
      <Header />

      {/* Main content grows and pushes footer down */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer always at bottom */}
      <Footer />
    </div>
  );
};

export default App;
