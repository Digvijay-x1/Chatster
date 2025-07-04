import { create } from 'zustand'
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
// In production, connect to the root path of the server, not /api
const BASE_URL = import.meta.env.MODE === 'production' ? window.location.origin : 'http://localhost:3333';

export const useAuthStore = create((set , get) => ({
    authUser: null,
    isSigningUp: false,
    isCheckingAuth: true,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [],
    socket: null,

    checkAuth: async()=>{
        try {
            const res = await axiosInstance.get('/auth/check');
            set({authUser: res.data})
            localStorage.setItem('authUserId', res.data._id);
            get().connectSocket();
        } catch (error) {
            console.log("Error checking auth", error);
            set({authUser: null})
            localStorage.removeItem('authUserId');
        }finally{
            set({isCheckingAuth: false})
        }
    },
    signup: async(data) =>{
        set({isSigningUp: true})
        try {
            
            const res = await axiosInstance.post('/auth/signup',data);
            set({authUser: res.data})
            localStorage.setItem('authUserId', res.data._id);
            toast.success('Account created successfully');
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }finally{
            set({isSigningUp: false})
        }
    },

    login: async (data)=>{
        set({isLoggingIn: true})
        try {
            const res = await axiosInstance.post('/auth/login', data);
            set({authUser: res.data})
            localStorage.setItem('authUserId', res.data._id);
            toast.success('Logged in successfully')
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({isLoggingIn: false})
        }
    },

    logout: async()=>{
        try {
            await axiosInstance.get('/auth/logout');
            set({authUser: null})
            localStorage.removeItem('authUserId');
            toast.success('Logged out successfully');
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    updateProfile: async(data)=>{
        set({isUpdatingProfile: true})
        try {
            const res = await axiosInstance.put('/auth/update-profile', data);
            set({authUser: res.data})
            toast.success('Profile updated successfully')
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating profile")
        }finally{
            set({isUpdatingProfile: false})
        }
    },
    connectSocket: ()=>{
        const authUser = get().authUser;
        if(!authUser|| get().socket?.connected) return;
        
        console.log("Connecting to socket at:", BASE_URL);
        try {
            const socket = io(BASE_URL, {
                query: {
                    userId: authUser._id,
                },
                withCredentials: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 20000
            });
            
            socket.on('connect', () => {
                console.log('Socket connected successfully with ID:', socket.id);
            });
            
            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                toast.error('Connection issue. Online status may not be accurate.');
            });
            
            socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
            });
            
            socket.on('reconnect_attempt', (attemptNumber) => {
                console.log('Socket reconnection attempt:', attemptNumber);
            });
            
            socket.on('getOnlineUsers', (userIds)=>{
                console.log('Received online users:', userIds);
                set({onlineUsers: userIds});
            });
            
            set({socket});
        } catch (error) {
            console.error('Error initializing socket:', error);
        }
    },
    disconnectSocket: ()=>{
        if(get().socket?.connected){
            get().socket.disconnect();
            set({socket: null});
        }
    },
}));