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
import { InviteBonus } from "../modules/InviteBonus.js";
 
 
async function generateUniqueReferCode(length = 8) {
  let referCode;
  let isUnique = false;

  while (!isUnique) {
    // Generate a random alphanumeric code
    referCode = crypto.randomBytes(Math.ceil(length / 2))
                      .toString('hex')
                      .slice(0, length)
                      .toUpperCase(); // Convert to uppercase for consistency

    // Check if the refer code is unique
    const existingUser = await User.findOne({ referCode });
    if (!existingUser) {
      isUnique = true; // If no user has this referCode, it's unique
    }
  }

  return referCode;
}


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
function generateRandomFourDigit() {
  return Math.floor(1000 + Math.random() * 9000);
}

export const registerUser = catcherrors(async (req, res, next) => {
  const { phoneNum,invitationCode,avatar, password, confirmPassword } = req.body;
   
  
 
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

   
  if (password !== confirmPassword) {
    return next(new errorHandler("Passwords do not match", 400));
  }

  const Username = generateRandomUsername();
  const UID = generateUID();
   

   
 

  let referCode =await generateUniqueReferCode(10)

  const user = await User.create({
    Username,
    UID,
    phoneNum,
    password,
    avatar,
    invitationCode,
    referCode
  });

  
  const invitationCodeuser = await User.findOne({referCode:invitationCode})
  if (invitationCodeuser) {
    const user_id = invitationCodeuser._id;
    
    const wallet = await Wallet.findOneAndUpdate(
      { user_id: user_id },       
      { $inc: { depositBalance: 10 } },   
      { new: true }              
    );
  
    if (!wallet) {
      new errorHandler("User not found !", 400)
    
    }

    const BonusAmount = 5;

    const invivateBounes = await InviteBonus.create({
      user_id:user_id,
      newUser:user._id,
      BonusAmount
    })
     
    // if (!invitedUserdepos) {
    //   new errorHandler("invivateBounes does  not found !", 400)
    
    // }
    if (!invivateBounes) {
      new errorHandler("invivateBounes does  not found !", 400)
    
    }
  }
  
  const wallet = await Wallet.create({
    user_id:user._id,
    depositBalance:20
  
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
    if ( !phoneNum  && email != null) {
      user = await User.findOne({ email }).select("+password");
      if (!user) {
        return next(new errorHandler("Invalid phone Number and password", 401));
      }
    } else   {
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
    return next(new errorHandler(error, 500));
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
      secure: process.env.NODE_ENV === "PRODUCTION",
      sameSite: process.env.NODE_ENV === "PRODUCTION" ? "None" : "Lax",
      path: "/", // Match this to the path where the cookie was set
    });
   

    res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  } catch (error) {
    return next(new errorHandler("Some error accurd", 401));
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
  const user = req.user;

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
  
  const _id = req.params.id
 
  const {  role } = req.body;
 
  const user = await User.findOne({_id});
  if (!user) {
    return next(
      new errorHandler(`User does not exist with Id : ${req.params.id}`)
    );
  }

  
  const newUserDate = {  role };
  await User.findByIdAndUpdate(_id, newUserDate, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    message:"role is updated successfully"
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
  const _id = req.params.id
  
  const user = await User.findById(_id);

  if (!user) {
    return next(
      new errorHandler(`User does not exist with Id : ${req.params.id}`)
    );
  }
 
  const wallet = await Wallet.findOne({ user_id:_id});

  if (!wallet) {
    return next(
      new errorHandler(`User does not exist with Id : ${req.params.id}`)
    );
  }
  
  
  const userdetails = {
    _id: user._id,
    phoneNum: user.phoneNum,
    Username: user.Username,
    email: user.email,
    UID: user.UID,
    avatar: user.avatar,
    role: user.role,
    createdAt:user.createdAt,
    wallet_id: wallet._id,
    user_id:wallet.user_id,
    depositBalance: wallet.depositBalance,
    withdrawableBalance: wallet.withdrawableBalance,
     
  };

  res.status(200).json({
    success: true,
    userdetails,
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
