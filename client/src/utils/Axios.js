import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummaryApi";

const Axios = axios.create({
    baseURL: baseURL,
    withCredentials: true, // required for auth cookies
});

// -------------------------------------------------------------
// 1) REQUEST INTERCEPTOR — adds access token to each request
// -------------------------------------------------------------
Axios.interceptors.request.use(
    async (config) => {
        const accessToken = localStorage.getItem("accesstoken");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// -------------------------------------------------------------
// 2) RESPONSE INTERCEPTOR — refreshes token on 401
// -------------------------------------------------------------
Axios.interceptors.response.use(
    (response) => {
        // success: simply return response
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // No response? Reject immediately.
        if (!error.response) {
            return Promise.reject(error);
        }

        // Prevent infinite retry loop
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("refreshToken");

            if (refreshToken) {
                const newAccessToken = await refreshAccessToken(refreshToken);

                if (newAccessToken) {
                    // add new access token to failed request
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    // retry request
                    return Axios(originalRequest);
                }
            }
        }

        return Promise.reject(error);
    }
);

// -------------------------------------------------------------
// 3) REFRESH ACCESS TOKEN FUNCTION
// -------------------------------------------------------------
const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await Axios({
            ...SummaryApi.refreshToken,
            headers: {
                Authorization: `Bearer ${refreshToken}`,
            },
        });

        const newToken = response.data.data.accessToken;
        localStorage.setItem("accesstoken", newToken);

        return newToken;
    } catch (error) {
        console.log("Token refresh failed:", error);
        return null;
    }
};

export default Axios;
