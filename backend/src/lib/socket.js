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

    // io.emit() is used to send a message to all connected clients

    socket.on('disconnect' , ()=>{
        console.log('a user disconnected',socket.id);
        delete userSocketMap[userId];
        io.emit('getOnlineUsers' , Object.keys(userSocketMap));
    })
})

export {io , app , server};