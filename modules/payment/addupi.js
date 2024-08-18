import mongoose from "mongoose";

const appupiandwalletId = new mongoose.Schema(
  {
    
    upiId: {
      type: String,
      required: true,
    },
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },
     
    walletId: {
      type: String,
      required: true,
       
    },
     
  },
  {
    timestamps: true, 
  }
);

const UpdateUpiId = mongoose.model("Depositforadminbankdetails", appupiandwalletId);

export default UpdateUpiId;
