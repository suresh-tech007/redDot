import express from "express";
 
 
import {deleteUSer, forgotPassowrd, getAllusers, getsingleuser, getuserDetails, loginUser, logout, registerUser, resetPassword, sendOtp, updatePassword, updateProfile, updateUserRole, verifyotp} from "../controlleres/useController.js"
import { authorizeRoles, isAuthenicatedUser } from "../middleware/auth.js";
import { otpMailValidator, verifyotpvalidator } from "../middleware/validatore.js";
 
const router = express.Router()

router.post("/register",registerUser)
router.post("/login",loginUser)
router.post("/password/forgot",forgotPassowrd)
router.put("/password/reset/:token",resetPassword)
router.get("/logout",logout)
router.post("/send-otp",otpMailValidator,sendOtp)
router.post("/verify-otp",verifyotpvalidator,verifyotp)
router.get("/me",isAuthenicatedUser,getuserDetails)
router.put("/me/update",isAuthenicatedUser,updateProfile)
router.put("/password/update",isAuthenicatedUser,updatePassword)
router.get("/admin/users",isAuthenicatedUser,authorizeRoles("admin"),getAllusers);
router.get("/admin/user/:id",isAuthenicatedUser,authorizeRoles("admin"),getsingleuser)
// router.get("/admin/user",isAuthenicatedUser,authorizeRoles("admin"),getsingleuser)
router.put("/admin/user/:id",isAuthenicatedUser,authorizeRoles("admin"),updateUserRole)
router.delete("/admin/user/:id",isAuthenicatedUser,authorizeRoles("admin"),deleteUSer)


export default router