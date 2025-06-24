import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { app , server } from "./lib/socket.js";
import path from "path";

const port = process.env.PORT || 3333;
const __dirname = path.resolve();

// Log the environment
console.log('NODE_ENV:', process.env.NODE_ENV);

// In production, we need to allow requests from the deployed frontend domain
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? true : "http://localhost:5173",
    credentials: true,
};

console.log('CORS config:', corsOptions);

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get("*", (req,res)=>{
        res.sendFile(path.join(__dirname, "../frontend", "dist","index.html"))
    })
}

server.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
    connectDB();
})  