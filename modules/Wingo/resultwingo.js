import mongoose from "mongoose";

const wingoBatleresultList = new mongoose.Schema(
  {
     
    Game_id: {
      type: String,
      required: true,
    },
    GameName: {
      type: String,
      required: true,
    },
    timerType:{
        type: String,
        required: true,

    },
    selectedNumber: {
      type: Number,
      required: true,
       
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const WingoResult = mongoose.model("Wingoresult", wingoBatleresultList);

export default WingoResult;
