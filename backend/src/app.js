import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";

const port = process.env.PORT || 3333;
const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
    connectDB();
})  