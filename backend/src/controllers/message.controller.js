import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async (req, res) =>{
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({
            _id: { $ne: loggedInUserId },
        }).select("-password")
        res.status(200).json(filteredUsers)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" })
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

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Failed to send message", message: error.message });
    }
}