import {createBrowserRouter} from "react-router-dom"
import App from "../App";
import Home from "../pages/Home";
import SearchPage from "../pages/SearchPage";
import Register from "../pages/Register";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import OtpVerification from "../components/OtpVerification.jsx";
import ResetPassword from "../components/ResetPassword.jsx";
import UserMenuMobile from "../pages/UserMenuMobile.jsx";
import Dashboard from "../layouts/Dashboard.jsx";
import Profile from "../pages/Profile.jsx";
import MyOrders from "../pages/MyOrders.jsx";
import Address from "../pages/Address.jsx";

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
            },
            {
                path : "user",
                element: <UserMenuMobile />
            },
            {
                path : "dashboard",
                element : <Dashboard />,
                children : [
                    {
                        path : "profile",
                        element : <Profile/>
                    },
                    {
                        path : "myorders",
                        element : <MyOrders/>
                    },
                    {
                        path : "address",
                        element : <Address/>
                    },
                    // {
                    //     path : 'category',
                    //     element : <AdminPermision><CategoryPage/></AdminPermision>
                    // },
                    // {
                    //     path : "subcategory",
                    //     element : <AdminPermision><SubCategoryPage/></AdminPermision>
                    // },
                    // {
                    //     path : 'upload-product',
                    //     element : <AdminPermision><UploadProduct/></AdminPermision>
                    // },
                    // {
                    //     path : 'product',
                    //     element : <AdminPermision><ProductAdmin/></AdminPermision>
                    // }
                ]
            },
        ]
    }
])
export default router