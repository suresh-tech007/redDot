import mongoose from "mongoose";

const BonusSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    newUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    BonusAmount: {
        type: Number,
        default: 0
    }
    
});

export const InviteBonus = mongoose.model('InviteBonus', BonusSchema);
