import mongoose from "mongoose";

const UserBetSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  
      required: true,
    },
    GameName: {
      type: String,
      required: true,
    },
    GameId: {
      type: String,
      required: true,
    },
    selectedTimer: {
      type: String,
      required: true,
    },
    uniqueBatleId: {
      type: String,
      required: true,
      unique: true,
    },
    chosen_number: {
      type: [String],
      default: null,
    },
    chosen_color: {
      type: [String],
      default: null,
    },
    chosen_big: {
      type: Boolean,
      default: null,
    },
    bet_amount: {
      type: Number,
      required: true,
    },
    win_amount: {
      type: Number,
      default: 0, // Calculated after game session ends
    },
    betstatus: {
      type: String,
      required: true,
      default: "Pending",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const UserBet = mongoose.model("UserBet", UserBetSchema);

export default UserBet;
