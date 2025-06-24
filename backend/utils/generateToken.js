import jwt from "jsonwebtoken";

export const generateToken = (res, userId) =>{
    let token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "1d"})
    
    // Configure cookie options based on environment
    const cookieOptions = {
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    };
    
    console.log('Setting JWT cookie with options:', cookieOptions);
    res.cookie('jwt', token, cookieOptions);

    return token;
}