import User from "../models/user.model.js";
import Message from "../models/message.model.js";

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
                {$and: [{from: myId}, {to: userToChatId}]},
                {$and: [{from: userToChatId}, {to: myId}]}
            ]
        })
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
            const uploadResult = await cloudinary.uploader.upload(image);
            imageUrl = uploadResult.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
          });

        res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to send message" });
    }
}