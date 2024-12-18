

import User from "../modules/userModel.js";
import { errorHandler } from "../utils/ErrorHandler.js";
import catcherrors from "./catchAsyncError.js";
import jwt from "jsonwebtoken"

const isAuthenicatedUser = catcherrors(async (req, res, next) => {
 
    const { token } = req.cookies;
 
    if (req.cookies && !req.cookies.token  && !token) {
        return next(new errorHandler("Please login to access this resource", 401));
    }

    let decodedData;
    try {
        decodedData = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return next(new errorHandler("Invalid or expired token", 401));
    }

    const rootUser = await User.findById(decodedData.id);
     
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

