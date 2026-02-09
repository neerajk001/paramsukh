import { User } from "../models/user.models.js";
import jwt from 'jsonwebtoken';


export const protectedRoutes = async(req, res, next) => {
    try {
        // Check for token in Authorization header (Bearer token) or cookies
        let token = '';
        
        // Check Authorization header first (for Postman/API clients)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        } else {
            // Fall back to cookie (for browser clients)
            token = req.cookies.token || '';
        }
        
        if(!token){
            return res.status(401).json({
                success: false,
                message: "No token provided. Please include token in Authorization header (Bearer token) or login to set cookie."
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded || !decoded.id){
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
        
        const user = await User.findById(decoded.id);
        if(!user){
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }
        
        req.user = user;
        next();
    } catch(error) {
        console.error("❌ Error in protected route middleware:", error);
        
        // Handle JWT specific errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please login again."
            });
        }
        
        return res.status(401).json({
            success: false,
            message: "Unauthorized access",
            error: error.message
        });
    }
}
