import User from "../modules/userModel.js";
import { errorHandler } from "../utils/ErrorHandler.js";
import catcherrors from "./catchAsyncError.js";
import jwt from "jsonwebtoken";

const isAuthenicatedUser = catcherrors(async (req, res, next) => {
    // Extract token from header
    const authHeader = req.headers['authorization'];
 
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new errorHandler("Please login to access this resource", 401));
    }

    const token = authHeader.split(' ')[1]; // Extract token after 'Bearer '

    let decodedData;
    try {
        decodedData = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return next(new errorHandler("Invalid or expired token", 401));
    }

    const rootUser = await User.findById(decodedData.id);
     
    if (!rootUser) {
        return next(new errorHandler("User not found", 404));
    }
    

    req.user = rootUser;
    req.token = token;

    next();
});

const authorizeRoles = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role !== role) {
            return next(new errorHandler(`Role: ${req.user.role} is not allowed to access this resource`, 403));
        }

        next();
    };
};

export { isAuthenicatedUser, authorizeRoles };
