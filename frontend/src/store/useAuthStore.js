import { create } from 'zustand'
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
const BASE_URL = 'http://localhost:3333';
export const useAuthStore = create((set , get) => ({
    authUser: null,
    isSigningUp: false,
    isCheckingAuth: true,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [],

    checkAuth: async()=>{
        try {
            const res = await axiosInstance.get('/auth/check');
            set({authUser: res.data})
            get().connectSocket();
        } catch (error) {
            console.log("Error checking auth", error);
            set({authUser: null})
        }finally{
            set({isCheckingAuth: false})
        }
    },
    signup: async(data) =>{
        set({isSigningUp: true})
        try {
            
            const res = await axiosInstance.post('/auth/signup',data);
            set({authUser: res.data})
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
        const socket = io(BASE_URL);
        socket.connect();
        set({socket});
    },
    disconnectSocket: ()=>{
        if(get().socket?.connected){
            get().socket.disconnect();
            set({socket: null});
        }
    },
}));