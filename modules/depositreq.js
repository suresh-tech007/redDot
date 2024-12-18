import mongoose from "mongoose";

const DipositreqvestSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    way: {
      type: String,
      required: true,
    },
    upi: {
      type: String,
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },
    transationId: {
      type: String,
      required: true,
      unique:true
    },
    UTR_Number: {
      type: String,
      required: true,
      unique:true
    },
    status:{
      type: String,
      required: true,
      default:"Pending"

    },
    newUser:{
      type: Boolean,
      required: true,
      default:false

    }
  },
  {
    timestamps: true, 
  }
);

const Depositreq = mongoose.model("Depositreq", DipositreqvestSchema);

export default Depositreq;
