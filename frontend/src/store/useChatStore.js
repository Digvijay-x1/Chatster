import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { persist } from "zustand/middleware";

export const useChatStore = create(
    persist(
        (set, get) => ({
            messages: [],
            users: [],
            selectedUser: null,
            isUsersLoading: false,
            isMessagesLoading: false,

            getUsers: async () => {
                set({ isUsersLoading: true });
                try {
                    const res = await axiosInstance.get("/messages/users");
                    set({ users: res.data, isUsersLoading: false });
                } catch (error) {
                    console.error("Error fetching users:", error);
                    toast.error(error?.response?.data?.message || "Failed to fetch users");
                    set({ isUsersLoading: false });
                }
            },

            getMessages: async (userId) => {
                if (!userId) return;
                
                set({ isMessagesLoading: true });
                try {
                    const res = await axiosInstance.get(`/messages/${userId}`);
                    set({ messages: res.data });
                } catch (error) {
                    console.error("Error fetching messages:", error);
                    toast.error(error?.response?.data?.message || "Failed to fetch messages");
                }
                set({ isMessagesLoading: false });
            },
            
            sendMessage: async (messageData) => {
                const { messages, selectedUser } = get();
                if (!selectedUser?._id) {
                    throw new Error("No chat selected");
                }
                
                try {
                    const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
                    if (res.data && res.data._id) {
                        set({ messages: [...messages, res.data] });
                        return res.data;
                    } else {
                        throw new Error("Invalid response from server");
                    }
                } catch (error) {
                    console.error("Error sending message:", error);
                    throw error;
                }
            },
            
            setSelectedUser: (selectedUser) => {
                set({ selectedUser });
                if (selectedUser?._id) {
                    get().getMessages(selectedUser._id);
                }
            },

            addNewMessage: (message) => {
                const { messages, selectedUser } = get();
                const authUserId = localStorage.getItem('authUserId');
                
                // Check if this message belongs to the current chat
                if (selectedUser && 
                    ((message.senderId === selectedUser._id && message.receiverId === authUserId) || 
                     (message.receiverId === selectedUser._id && message.senderId === authUserId))) {
                    console.log("Adding new message to chat:", message);
                    set({ messages: [...messages, message] });
                }
            },
        }),
        {
            name: "chat-storage",
        }
    )
);