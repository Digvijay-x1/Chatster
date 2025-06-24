import axios from 'axios'

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3333/api',
    withCredentials: true,
    timeout: 60000, // 60 seconds timeout for larger uploads
    maxContentLength: 50 * 1024 * 1024, // 50MB max content length
    maxBodyLength: 50 * 1024 * 1024, // 50MB max body length
})