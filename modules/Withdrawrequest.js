import mongoose from "mongoose";

const WithdrawreqvestSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    way: {
      type: String,
      required: true,
    },
    transactionaccount: {
      type: String,
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },
    transationId: {
      type: String,
      required: true,
      unique:true
    },
    status:{
      type: String,
      required: true,
      default:"Pending"

    }
  },
  {
    timestamps: true, 
  }
);

const Withdrawreq = mongoose.model("Withdrawreq", WithdrawreqvestSchema);

export default Withdrawreq;
