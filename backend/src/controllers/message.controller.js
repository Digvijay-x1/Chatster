import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, emitNewMessage } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) =>{
    try {
        const loggedInUserId = req.user._id;
        console.log('Fetching users for sidebar, logged in user:', loggedInUserId);
        
        if (!loggedInUserId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        
        const filteredUsers = await User.find({
            _id: { $ne: loggedInUserId },
        }).select("-password");
        
        console.log(`Found ${filteredUsers.length} users for sidebar`);
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error fetching users for sidebar:", error);
        res.status(500).json({ error: "Failed to fetch users", message: error.message });
    }
}

export const getMessages = async (req, res) =>{
    try {
        const {id:userToChatId} = req.params;
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [
                {$and: [{senderId: myId}, {receiverId: userToChatId}]},
                {$and: [{senderId: userToChatId}, {receiverId: myId}]}
            ]
        }).sort({ createdAt: 1 });
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages" })
    }
}

export const sendMessage = async (req, res) =>{
    try {
        const {text , image} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            // Configure upload options with higher quality and performance settings
            const uploadOptions = {
                resource_type: "image",
                quality: "auto",
                fetch_format: "auto",
                // Add timeout settings for larger uploads
                timeout: 120000, // 2 minutes
            };
            
            const uploadResult = await cloudinary.uploader.upload(image, uploadOptions);
            imageUrl = uploadResult.secure_url;
        }
        
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        // Convert Mongoose document to plain object
        const messageToSend = newMessage.toObject();

        // Emit socket event for real-time messaging
        emitNewMessage(messageToSend);

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Failed to send message", message: error.message });
    }
}