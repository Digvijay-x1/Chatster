import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/generateToken.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) =>{
    const {fullname, email, password} = req.body;

    try {

        if(!fullname || !email || !password){
            return res.status(400).json({message: "All fields are required"})
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters long"})
        }

        const user = await User.findOne({email})
        if(user){
            return res.status(400).json({message: "User already exists"})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const newUser = await User.create({fullname, email, password: hashedPassword})
        if(newUser){
            await newUser.save();
            generateToken(res, newUser._id);
            res.status(201).json({message: "User created successfully", user: newUser})
        }else{
            res.status(400).json({message: "Invalid user data"})
        }
    } catch (error) {
        res.status(500).json({message: "Internal server error"})
    }

}
export const login = async(req, res) =>{
    let {email, password} = req.body;
    try {
        if(!email || !password){
            return res.status(400).json({message: "All fields are required"})
        }
        const user = await User.findOne({email})
        if(user && (await bcrypt.compare(password, user.password))){
            generateToken(res, user._id);
            res.status(201).json({message: "User logged in successfully", user: user})
        }else{
            res.status(401).json({message: "Invalid email or password"})
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: "Internal server error"})
    }
}
export const logout = (req, res) =>{
    try {
        res.cookie('jwt', '', {maxAge: 0})
        res.status(200).json({message: "User logged out successfully"})
    } catch (error) {
        res.status(500).json({message: "Internal server error"})
    }
}

export const updateProfile = async (req, res) => {
    try {
      const { profilePic } = req.body;
      const userId = req.user._id;
  
      if (!profilePic) {
        return res.status(400).json({ message: "Profile pic is required" });
      }
  
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
      );
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.log("error in update profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

export const checkAuth = async (req, res) =>{
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: "Internal server error"})
    }
}