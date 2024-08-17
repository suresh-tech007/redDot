import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    depositBalance: {
        type: Number,
        default: 0
    },
    withdrawableBalance: {
        type: Number,
        default: 0
    }
});

export const Wallet = mongoose.model('Wallet', WalletSchema);
