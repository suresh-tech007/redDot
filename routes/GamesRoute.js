import express from 'express'
import {   getresults, userbet, UserGameHistory } from '../controlleres/Gamecontroller.js';
import { isAuthenicatedUser } from '../middleware/auth.js';


const router = express.Router()


router.post("/userwingobatle",isAuthenicatedUser,userbet)
router.get("/resulthistory",isAuthenicatedUser,getresults)
router.get("/userGameHistory",isAuthenicatedUser,UserGameHistory)



export default router;