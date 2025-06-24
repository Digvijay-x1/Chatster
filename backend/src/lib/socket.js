import { Server } from "socket.io";
import http from "http";
import express from 'express';

const app = express();

const server = http.createServer(app);

const io = new Server(server , {
    cors: {
        origin: ['http://localhost:5173'],
    }
});
// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on('connection' , (socket)=>{
    console.log('a user connected',socket.id);

    const userId = socket.handshake.query.userId;
    if(userId){
        userSocketMap[userId] = socket.id;
        // Emit updated online users list immediately after this user connects
        io.emit('getOnlineUsers' , Object.keys(userSocketMap));
    }

    // Handle new message event
    socket.on('sendMessage', (message) => {
        const receiverSocketId = userSocketMap[message.receiverId];
        if (receiverSocketId) {
            // Send message to the specific receiver
            io.to(receiverSocketId).emit('newMessage', message);
        }
    });

    socket.on('disconnect' , ()=>{
        console.log('a user disconnected',socket.id);
        delete userSocketMap[userId];
        io.emit('getOnlineUsers' , Object.keys(userSocketMap));
    })
})

// Function to emit a new message to a specific user
const emitNewMessage = (message) => {
    const receiverSocketId = userSocketMap[message.receiverId];
    if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', message);
    }
}

export {io , app , server, emitNewMessage};