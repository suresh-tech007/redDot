import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import crypto from "crypto"

const userSchema= new mongoose.Schema({
    phoneNum:{
        type:String,
        unique:true,
        required:[true,"Please Enter Your phone Number "],
         

    },
    Username:{
        type:String,
        required:[true,"Please Enter Your Username "],
        
        maxLength: [30,"Name cannot exceed 30 characters "],
        minLength:[4,"Name should have more than 4 characters"]
    },
    email:{
        type:String,    
         default:""
        
        
    },
   
    password:{
        type:String,
        required:[true,"Please Enter Your Email "],
        minLengthL:[8,"Passeord should be greater than 8 characters "],
        select:false,

    },
    
    UID:{
        type:String,
        required:[true,"Please Enter Your UID "],
        unique:true,

    },
    avatar:{
         
            
                type:String,
                required:true,
            
        
    },
    role:{
        type:String,
        required:[true,"Please Enter Your Role "],
        default:"user"
    },
    createdAt:{
        type:Date,
        default:Date.now
    },

    resetPasswordToken: String,
    resetPasswordExpire:Date
});

userSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        return next();
    }

    this.password =await bcrypt.hash(this.password,10)
})

// JWT TOKEN ==>
userSchema.methods.getJwtToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    })

}


// Compate password = 
// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    try {
        // No need to use await here, directly access this.password
        const hashedPassword = this.password;
        // console.log("Hashed Password:", hashedPassword);
        // console.log("Entered Password:", enteredPassword);
        
        // Compare passwords
        const isMatch = await bcrypt.compare(enteredPassword, hashedPassword);
        // console.log("Password Match:", isMatch);
        
        return isMatch;
    } catch (error) {
        console.error("Error in comparing passwords:", error);
        throw new Error("Error in comparing passwords");
    }
}

 

// Generating Password Reset Token =>

userSchema.methods.getResetPasswordToken = function (){
    // Generating token 
    const resetToken = crypto.randomBytes(20).toString("hex")

    // Hashing and adding resetPasswordToken to userSchema 
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");


    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000 ;

    return resetToken;

}



const User = mongoose.model("User",userSchema)

export default User;