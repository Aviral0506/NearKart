import {createBrowserRouter} from "react-router-dom"
import App from "../App";
import Home from "../pages/Home";
import SearchPage from "../pages/SearchPage";
import Register from "../pages/Register";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import OtpVerification from "../components/OtpVerification.jsx";
import ResetPassword from "../components/ResetPassword.jsx";
const router = createBrowserRouter([
    {
        path : "/",
        element: <App />,
        children: [
            {
                path: "",
                element: <Home />
            },
            {
                path : "search",
                element: <SearchPage />
            },
            {
                path: "register",
                element: <Register />
            },
            {
                path: "login",
                element: <Login />
            }, 
            {
                path: "forgot-password",
                element: <ForgotPassword />
            },
            {
                path: "verification-otp",
                element: <OtpVerification />
            },
            {
                path: "reset-password",
                element: <ResetPassword />  
            }
        ]
    }
])
export default router