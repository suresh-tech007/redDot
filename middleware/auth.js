import User from "../modules/userModel.js";
import { errorHandler } from "../utils/ErrorHandler.js";
import catcherrors from "./catchAsyncError.js";
import jwt from "jsonwebtoken"


const isAuthenicatedUser = catcherrors(async(req,res,next)=>{

    const {token} = req.cookies;
       
    if(!token){
        return next(new errorHandler("please login to access this resource",401))

    }

    const decodedData =  jwt.verify(token,process.env.JWT_SECRET)

   const rootUser = await User.findById(decodedData.id)
    req.user = rootUser;
    req.token=token


    next()

     

})
const authorizeRoles =  (role)=>{
    return ((req,res,next)=>{
        if(!role==req.user.role){
        return next(    new errorHandler(`Role : ${req.user.role} is not allowed to access the resource `,403) )
        }

        next();
    })

}

export  {isAuthenicatedUser,authorizeRoles} ;