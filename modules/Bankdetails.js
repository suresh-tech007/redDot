import mongoose from "mongoose";

const BankDetailsSchema = new mongoose.Schema(
  {
    
    bankName: {
      type: String,
      required: true,
    },
    Holder: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique:true
    },
    IFSCcode: {
      type: String,
      required: true,
       
    }
     
  },
  {
    timestamps: true, 
  }
);

const Bankdetails = mongoose.model("Bankdetails", BankDetailsSchema);

export default Bankdetails;
