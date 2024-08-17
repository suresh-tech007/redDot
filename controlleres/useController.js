import { errorHandler } from "../utils/ErrorHandler.js";
import catcherrors from "../middleware/catchAsyncError.js";
import User from "../modules/userModel.js";
 
import sendToken from "../utils/jwtToken.js";
import crypto from "crypto";
import cloudniry from "cloudinary";
import { validationResult } from "express-validator";

import { sendEmail } from "../utils/sendEmail.js";
import Otp from "../modules/opt.js";
import { oneMintex, threeMinex } from "../utils/otpValidate.js";
import { Wallet } from "../modules/Wallet.js";

function generateRandomUsername() {
  const randomString = crypto.randomBytes(2).toString("hex");
  const timestamp = Date.now();
  return `User${randomString}${timestamp}`;
}
function generateUID(length = 8) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uid = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uid += characters[randomIndex];
  }

  return uid;
}

export const registerUser = catcherrors(async (req, res, next) => {
  const { phoneNum, password, inviteCode, confirmPassword } = req.body;
   

  // Validate phone number length and format
  const phoneNumPattern = /^[0-9]{10}$/;
  if (!phoneNumPattern.test(phoneNum)) {
    return next(
      new errorHandler("Invalid phone number. It must be 10 digits long.", 400)
    );
  }

  const oldUser = await User.findOne({ phoneNum });
  if (oldUser) {
    return next(new errorHandler("User already exists", 400));
  }

  // Corrected password match validation
  if (password !== confirmPassword) {
    return next(new errorHandler("Passwords do not match", 400));
  }

  const Username = generateRandomUsername();
  const UID = generateUID();
  const avatar = `https://avatar.iran.liara.run/public/boy?username=${Username}`;

  let balance = 0;
  if (inviteCode == "suresh86899") {
    balance = 20.0;
  }
 

  const user = await User.create({
    Username,
    UID,
    phoneNum,
    password,
    avatar,
  
    inviteCode,
  });

  const wallet = await Wallet.create({
    user_id:user._id,
    depositBalance:balance
  
  })

   
  if(!wallet){
    return next(new errorHandler("Some error occurred", 500));

  }


  sendToken(user, "true", 201, res);
});

// Login User ==>
export const loginUser = catcherrors(async (req, res, next) => {
  const { phoneNum, rememberMe, email, password } = req.body;

  if (!email && !phoneNum) {
    return next(new errorHandler("Please Enter Email & phoneNum", 400));
  }
   

  let user;

  try {
    if (phoneNum === null) {
      user = await User.findOne({ email }).select("+password");
      if (!user) {
        return next(new errorHandler("Invalid email and password", 401));
      }
    } else if (phoneNum) {
      const phoneNumPattern = /^[0-9]{10}$/;
      if (!phoneNumPattern.test(phoneNum)) {
        return next(
          new errorHandler(
            "Invalid phone number. It must be 10 digits long.",
            400
          )
        );
      }
      user = await User.findOne({ phoneNum }).select("+password");
      if (!user) {
        return next(new errorHandler("Invalid phone number and password", 401));
      }
    }
  } catch (error) {
    return next(new errorHandler("Error finding user", 500));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new errorHandler("Invalid email or passwords", 401));
  }

  sendToken(user, rememberMe, 200, res);
});

//

// Logout User ==>

const logout = catcherrors(async (req, res, next) => {
  try {
    // Clear the token cookie

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/", // Match this to the path where the cookie was set
    });

    res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Forgot password ==>

const forgotPassowrd = catcherrors(async (req, res, next) => {
  const { phoneNum, email } = req.body;

  if (!email && !phoneNum) {
    return next(new errorHandler("Please Enter Email & phoneNum", 400));
  }

  let user;

  try {
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        return next(new errorHandler("Invalid email and password", 401));
      }

      // Get  resetPassword token
      const resettoken = await user.getResetPasswordToken();

      await user.save({ validateBeforeSave: false });

      const resetPasswordURL = `https://kaleidoscopic-alfajores-22ce37.netlify.app/password/reset/${resettoken}`;

      const message = ` Your password token is   :- \n\n ${resetPasswordURL} \n\n if you have requested this email then , please ignore it `;

      try {
        await sendEmail({
          email: user.email,
          subject: `Ecommerce Password Recovery`,
          message,
        });
        res.status(200).json({
          success: true,
          message: `Email sent to ${user.email} successfully`,
        });
      } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new errorHandler(error.message, 500));
      }
    } else if (phoneNum) {
      user = await User.findOne({ phoneNum });
      if (!user) {
        return next(new errorHandler("Invalid phone number and password", 401));
      }

      // comming soon
      return next(new errorHandler("please Enter your phoneNuber", 500));
    }
  } catch (error) {
    return next(new errorHandler("Error finding user", 500));
  }
});

function generateRandomFourDigit() {
  return Math.floor(1000 + Math.random() * 9000);
}

export const sendOtp = catcherrors(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new errorHandler("Email is not valid", 400));
  }

  const { user_id: _id, email } = req.body;
  const emailUser = await User.findOne({ email });

  if (emailUser) {
    return next(new errorHandler("Email exists on another account", 401));
  }

  const user = await User.findOne({ _id });
  if (!user) {
    return next(new errorHandler("User not found", 400));
  }

  const otp = generateRandomFourDigit();
  const oldotpdata = await Otp.findOne({ user_id: _id });
  if (oldotpdata) {
    const otpTime = oldotpdata.timestamp;
    const sendNextotp = await oneMintex({ otpTime, next });
    if (!sendNextotp) {
      return next(new errorHandler("OTP is expired!", 400));
    }
  }

  const cDate = new Date();
  await Otp.findOneAndUpdate(
    { user_id: _id },
    {
      otp,
      timestamp: new Date(cDate.getTime()),
    },
    { upsert: true, new: true, satDefaultsOnInsert: true }
  );

  const msg = "<p> Hi <b>" + user.Username + "</b>,</p><h4>" + otp + "</h4>";
  try {
    const options = {
      email,
      subject: `OTP Verification`,
      message: msg,
    };
    await sendEmail({ options, next });
    res.status(200).json({
      success: true,
      message: `Email sent to ${email} successfully`,
    });
  } catch (error) {
    await user.save({ validateBeforeSave: false });

    return next(new errorHandler(error.message, 500));
  }
});

export const verifyotp = catcherrors(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new errorHandler(" Please enter the correct code", 400));
  }

  const { user_id, otp, email } = req.body;

  const otpData = await Otp.findOne({ user_id, otp });
  if (!otpData) {
    return next(
      new errorHandler("OTP is not valid. Please enter the correct code", 400)
    );
  }

  const otpTime = otpData.timestamp;

  const expireotp = await threeMinex({ otpTime, next });
  if (expireotp) {
    return next(new errorHandler("OTP is expired!", 400));
  }

  const user = await User.findOneAndUpdate(
    { _id: user_id },
    { email },
    { upsert: true, new: true, satDefaultsOnInsert: true }
  );

  return res.status(200).json({
    success: true,
    message: `Email Verified successfully`,
    user,
  });
});

const resetPassword = catcherrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new errorHandler(
        "Reset Password Token is invalid or has been expired ",
        404
      )
    );
  }

  const { password, confirmpassword } = req.body;

  if (password !== confirmpassword) {
    return next(new errorHandler("Password does not match ", 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// GET USER DETAILES ==>

const getuserDetails = catcherrors(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// update user password==>
const updatePassword = catcherrors(async (req, res, next) => {
  const { oldpassword, newpassword, confirmpassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  const isPasseordMatched = await user.comparePassword(oldpassword);

  if (!isPasseordMatched) {
    return next(new errorHandler("Old password is incorrect ", 400));
  }

  if (newpassword !== confirmpassword) {
    return next(new errorHandler("password does not match", 400));
  }
  user.password = newpassword;
  await user.save();

  sendToken(user, "true", 200, res);
});

// Update User Profile ==>

const updateProfile = catcherrors(async (req, res) => {
  const { Username, email, avatar } = req.body;

  // Fetch the user from the database
  const user = await User.findById(req.user.id);

  // Initialize newUserDate with existing user data
  const newUserDate = {
    Username: Username || user.Username,
    email: email || user.email,
    avatar: avatar || user.avatar,
  };

  

  try {
    // Attempt to update the user in the database
    const updatedUser = await User.findByIdAndUpdate(req.user.id, newUserDate, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    if (!updatedUser) {
      
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

  

    // Send success response
    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    
    // Send error response
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the user",
    });
  }
});

// Update User Role ==>

const updateUserRole = catcherrors(async (req, res) => {
  const { Username, email, role } = req.body;
  const newUserDate = { Username, email, role };
  await User.findByIdAndUpdate(req.params.id, newUserDate, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
  });
});

const deleteUSer = catcherrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new errorHandler(`User does not exist with Id : ${req.params.id}`)
    );
  }
  const iamgeID = user.avatar.public_id;
  await cloudniry.uploader.destroy(iamgeID);
  await user.deleteOne();
  res.status(200).json({
    success: true,
    message: "User deleted successfully ",
  });
});

// Get All users (admin)

const getAllusers = catcherrors(async (req, res, next) => {
  const users = await User.find();

  if (!users) {
    return next(new errorHandler(`Users does not exists `));
  }

  res.status(200).json({
    success: true,
    users,
  });
});

// Get single user (Admin)

const getsingleuser = catcherrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new errorHandler(`User does not exist with Id : ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

export {
  logout,
  forgotPassowrd,
  resetPassword,
  getuserDetails,
  updatePassword,
  updateProfile,
  getAllusers,
  getsingleuser,
  updateUserRole,
  deleteUSer,
};
