import { errorHandler } from "./ErrorHandler.js";

export const oneMintex = async({otpTime,next})=>{
    try {
        const c_date = new Date();
        let differenceValue = (otpTime -  c_date.getTime() )/1000;
        differenceValue /=60;

        if(Math.abs(differenceValue)>1){
            return true

        }
        return false;
        
    } catch (error) {
        return next(new errorHandler("OTP is expired. Please try some time", 400));
        
    }
}


export const threeMinex = async({otpTime,next})=>{
    try {
        const c_date = new Date();
        let differenceValue = (otpTime -  c_date.getTime() )/1000;
        differenceValue /=60;

        if(Math.abs(differenceValue)>3){
            return true

        }
        return false;
        
    } catch (error) {
        return next(new errorHandler("OTP is expired. Please try some time", 400));
        
    }
}




 