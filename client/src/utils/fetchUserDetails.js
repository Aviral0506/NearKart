import Axios from "./Axios"
import SummaryApi from "../common/SummaryApi"

const fetchUserDetails = async()=>{
    try {
        const response = await Axios({
            ...SummaryApi.userDetails
        })
        
        if (response.data?.success) {
            return response.data;
        }
        
        console.log("User details fetch failed:", response.data?.message);
        return null;
    } catch (error) {
        console.error("Error fetching user details:", error.response?.data?.message || error.message);
        return null;
    }
}

export default fetchUserDetails