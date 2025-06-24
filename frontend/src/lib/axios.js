import axios from 'axios'

// Create axios instance with retry logic
export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3333/api',
    withCredentials: true,
    timeout: 60000, // 60 seconds timeout for larger uploads
    maxContentLength: 50 * 1024 * 1024, // 50MB max content length
    maxBodyLength: 50 * 1024 * 1024, // 50MB max body length
})

// Add a response interceptor for handling errors
axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const { config, response } = error;
        
        // If the error is due to a 502 Bad Gateway and we haven't retried yet
        if (response && response.status === 502 && !config._retry) {
            config._retry = true;
            console.log('Retrying request due to 502 error...');
            
            // Wait for 1 second before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Return a new request
            return axiosInstance(config);
        }
        
        return Promise.reject(error);
    }
);