import mongoose from "mongoose";

const Deposutdetails = new mongoose.Schema({
   
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    invitationUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
       required:true
    },
    amount: {
        type: Number,
        required:true
    }
    
});

export const InvitedUserDepositdetails = mongoose.model('InvitedUserDepositdetails', Deposutdetails);
