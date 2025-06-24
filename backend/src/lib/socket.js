import { Server } from "socket.io";
import http from "http";
import express from 'express';

const app = express();

const server = http.createServer(app);

console.log("Socket.io CORS config:", process.env.NODE_ENV === 'production' ? "All origins (true)" : "http://localhost:5173");

const io = new Server(server , {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? true : ['http://localhost:5173'],
        credentials: true
    }
});
// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on('connection' , (socket)=>{
    console.log('a user connected', socket.id);
    console.log('connection query params:', socket.handshake.query);

    const userId = socket.handshake.query.userId;
    if(userId){
        userSocketMap[userId] = socket.id;
        // Emit updated online users list immediately after this user connects
        io.emit('getOnlineUsers' , Object.keys(userSocketMap));
        console.log('Current online users:', Object.keys(userSocketMap));
    } else {
        console.log('Warning: User connected without userId in query params');
    }

    // Handle new message event
    socket.on('sendMessage', (message) => {
        console.log('Message received:', message);
        const receiverSocketId = userSocketMap[message.receiverId];
        if (receiverSocketId) {
            // Send message to the specific receiver
            io.to(receiverSocketId).emit('newMessage', message);
            console.log('Message sent to:', receiverSocketId);
        } else {
            console.log('Receiver not online:', message.receiverId);
        }
    });

    socket.on('disconnect' , ()=>{
        console.log('a user disconnected', socket.id);
        delete userSocketMap[userId];
        io.emit('getOnlineUsers' , Object.keys(userSocketMap));
        console.log('Updated online users after disconnect:', Object.keys(userSocketMap));
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
})

// Function to emit a new message to a specific user
const emitNewMessage = (message) => {
    const receiverSocketId = userSocketMap[message.receiverId];
    if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', message);
        return true;
    }
    return false;
}

export {io , app , server, emitNewMessage};