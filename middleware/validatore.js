import {check} from "express-validator"

export const otpMailValidator = [
    check('email', 'Please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots: true
    })
];


export const verifyotpvalidator = [
    check('user_id','User Id is required ').not().isEmpty(),
    check('otp','OTP is required').not().isEmpty()

]