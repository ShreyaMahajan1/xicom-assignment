import axios from "axios";

const axiosInstance = axios.create({
    baseURL : import.meta.env.VITE_API_XICOM_ASSIGNMENT_API
})
export default axiosInstance
