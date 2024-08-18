import { errorHandler } from "../utils/ErrorHandler.js";
import catcherrors from "../middleware/catchAsyncError.js";
import Depositreq from "../modules/depositreq.js";
import User from "../modules/userModel.js";
import Bankdetails from "../modules/Bankdetails.js";
import Withdrawreq from "../modules/Withdrawrequest.js";
import { Wallet } from "../modules/Wallet.js";
import UpdateUpiId from "../modules/payment/addupi.js";

// CREATE PAYMENT GATWAY DETAILS ==>
export const Upifordeposit = catcherrors(async (req, res, next) => {
  const { upiId, walletId } = req.body;
  const user = req.user;

   
  if (user.role !== "admin") {
    return next(new errorHandler("Unauthorized", 405));
  }

   
  if (!upiId || !walletId) {
    return next(new errorHandler("Please enter valid values", 405));
  }

   
  let UpiIdupdate = await UpdateUpiId.findOne({ user: user._id });

  if (UpiIdupdate) {
     
    UpiIdupdate.upiId = upiId;
    UpiIdupdate.walletId = walletId;
  } else {
     
    UpiIdupdate = new UpdateUpiId({ upiId, walletId, user: user._id });
  }

  
  await UpiIdupdate.save();

  res.status(200).json({
    success: true,
    message: "UPI ID updated/created successfully",
    UpiIdupdate,
  });
});

// 
export const getUpiDetails = catcherrors(async (req, res, next) => {
   
  const UpiDetails = await UpdateUpiId.findOne();

  // If no record is found, return an error
  if (!UpiDetails) {
      return next(new errorHandler("No UPI ID found for this walletId", 404));
  }

  // Send the UPI details to the frontend
  res.status(200).json({
      success: true,
      UpiDetails
  });

});


// USER REQUEST FOR DEPOSIT -->
export const requsetfordeposit = catcherrors(async (req, res, next) => {
  const { amount, way, upi, user, transationId, utr: UTR_Number } = req.body;

  if (!amount || !way || !upi || !user || !transationId || !UTR_Number) {
    return next(new errorHandler("Please Enter valid values ", 405));
  }
  const users = await User.findOne({ _id: user });
  if (!users) {
    return next(new errorHandler("user not found ", 400));
  }

  let user_name = users.Username;

  const depositreqvest = await Depositreq.create({
    amount,
    way,
    upi,
    user,
    user_name,
    transationId,
    UTR_Number,
  });

  if (!depositreqvest) {
    return next(new errorHandler("Failed to submit deposit request", 405));
  }

  res.status(200).json({
    success: true,
    message: "request is submited , please check amount after some time ",
    // depositreqvest,
  });
});

// ALL USER REQUESTS FOR DEPOSIT -->
export const alluserrequsetfordeposit = catcherrors(async (req, res, next) => {
  const user_id = req.user._id;
  if (!user_id) {
    return next(new errorHandler("Enter valid values ", 400));
  }

  const deposithistores = await Depositreq.find({ user: user_id });
  const deposithistory = deposithistores.reverse();
  if (!deposithistory) {
    return next(new errorHandler("Deposit Transactoin not found ", 400));
  }

  res.status(200).json({
    success: true,
    deposithistory,
  });
});

// ALL REQUESTS FOR DEPOSITS BY USERS (ADMIN)
export const allrequsetfordeposit = catcherrors(async (req, res, next) => {
  const deposithistory = await Depositreq.find();
  if (!deposithistory) {
    return next(new errorHandler("Deposit Transactoin not found ", 400));
  }

  res.status(200).json({
    success: true,
    deposithistory,
  });
});

// ADD MONEY IS USERS WALLET (ADMIN)
export const addmoneyiswallet = catcherrors(async (req, res, next) => {
  const { depositrequest_id, status } = req.body;
  if (!depositrequest_id) {
    return next(new errorHandler("Enter valid values ", 400));
  }

  const depositreqvest = await Depositreq.findOne({ _id: depositrequest_id });
  if (!depositreqvest) {
    return next(new errorHandler("Deposit Transactoin not found ", 400));
  }
  const _id = depositreqvest.user;
  const amount = depositreqvest.amount;

  const user = await User.findOne({ _id });
  if (!user) {
    return next(new errorHandler("User not found ", 400));
  }
  if (status == "Success") {
    await Wallet.findOneAndUpdate(
      { user_id: _id },
      { $inc: { depositBalance: +amount } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "money added in wallet successfully",
      // useramount,
      // deposistatus
    });
  } else if (status === "Failed") {
    const deposistatus = await Depositreq.findOneAndUpdate(
      { _id: depositrequest_id },
      { status: "Failed" },
      { upsert: true, new: true, satDefaultsOnInsert: true }
    );
    res.status(200).json({
      success: true,
      deposistatus,
    });
  } else {
    const deposistatus = await Depositreq.findOneAndUpdate(
      { _id: depositrequest_id },
      { status },
      { upsert: true, new: true, satDefaultsOnInsert: true }
    );
    res.status(200).json({
      success: true,
      deposistatus,
    });
  }
});

// ADD BANK DETAILS -->
export const addbankaccount = catcherrors(async (req, res, next) => {
  const { bankName, Holder, accountNumber, phoneNumber, IFSCcode } = req.body;
  const user = req.user;

  if (!user) {
    return next(new errorHandler("User not found ", 400));
  }

  const accessbandetails = await Bankdetails.findOne({ user: user._id });

  if (accessbandetails) {
    return next(new errorHandler("This bank account is already added", 400));
  }

  const bankdetails = await Bankdetails.create({
    bankName,
    Holder,
    accountNumber,
    phoneNumber,
    IFSCcode,
    user: user,
  });

  if (!bankdetails) {
    return next(
      new errorHandler(
        "An error occurred. Please try again after some time",
        500
      )
    );
  }

  res.status(200).json({
    success: true,
    message: "bank added successfully",
  });
});

// GET BANK DETAILS -->
export const getbankdetails = catcherrors(async (req, res, next) => {
  const user = req.user._id;

  const bankdetails = await Bankdetails.findOne({ user });

  if (!bankdetails) {
    return res.status(200).json({
      success: true,
      bankdetails:null
    });
  }

  res.status(200).json({
    success: true,

    bankdetails,
  });
});

// USER REQUEST FOR WITHDRAW -->
export const withdrawRequest = catcherrors(async (req, res, next) => {
  let { way, upiId, bankdetails, transationId, amount, walletID } = req.body;
  const user_id = req.user._id;

  

  if (!way || !amount || !transationId) {
    return next(new errorHandler("Enter valid values", 400));
  }
  if ( amount <110) {
    return next(new errorHandler("Enter valid values", 400));
  }

  if (!bankdetails && !upiId && !walletID) {
    return next(new errorHandler("Enter valid values", 400));
  }

  const user = await User.findById(user_id);
  if (!user) {
    return next(new errorHandler("User not found!", 400));
  }

  let transactionaccount = null;

  if (upiId) {
    transactionaccount = upiId;
  } else if (bankdetails) {
    transactionaccount = bankdetails;
  } else if (walletID) {
    transactionaccount = walletID;
  }

  if (!transactionaccount) {
    return next(
      new errorHandler("Enter valid transaction account details!", 400)
    );
  }

  const wallet = await Wallet.findOne({ user_id });

  if (!wallet) {
    return next(
      new errorHandler("An error occurred. Please try again later.", 500)
    );
  }
  if (wallet.withdrawableBalance < amount) {
    return next(
      new errorHandler(
        `Insufficient funds. Your balance is ₹${Wallet.withdrawableBalance}.`,
        400
      )
    );
  }

  await Wallet.findOneAndUpdate(
    { user_id },
    { $inc: { withdrawableBalance: -amount } },
    { new: true }
  );

  amount = (amount / 100) * 90;
  amount = amount.toFixed(2);

  const withdrawRequest = await Withdrawreq.create({
    amount,
    way,
    transactionaccount,
    user_name: user.Username,
    user_id,
    transationId,
    status: "pending",
  });

  if (!withdrawRequest) {
    return next(
      new errorHandler(
        `Insufficient funds. Your balance is ₹${withdrawAmount.withdrawAmount}.`,
        400
      )
    );
  }

  // Respond with the updated user information
  return res.status(200).json({
    success: true,
    message: "Withdrawal successful",
  });
});

// ALL WITHDRAW TRANSACTION BY USER -->
export const userAllwithdrawRequest = catcherrors(async (req, res, next) => {
  const user_id = req.user._id;

  if (!user_id) {
    return next(new errorHandler("Enter valid values ", 400));
  }

  const withdrawhistorys = await Withdrawreq.find({ user_id });

  const withdrawhistory = withdrawhistorys.reverse();

  if (!withdrawhistory) {
    return next(new errorHandler("Withdraw Transactoin not found ", 400));
  }

  res.status(200).json({
    success: true,
    withdrawhistory,
  });
});

// CHECK WALLET BALANCE ==>
export const walletbalance = catcherrors(async (req, res, next) => {
  const user_id = req.user._id;

  const wallet = await Wallet.findOne({ user_id });

  if (!wallet) {
    throw new Error("Wallet not found");
  }
  res.status(200).json({
    success: true,
    withdrawableBalance:wallet.withdrawableBalance,
    depositBalance:wallet.depositBalance,
  });
});

// ALL WITHDRAW TRANSACTION BY USERS(ADMIN) -->
export const usersAllwithdrawRequest = catcherrors(async (req, res, next) => {
  const allwithdrawtransactions = await Withdrawreq.find(); 
  
  const allwithdrawtransaction = allwithdrawtransactions.reverse();
  if (!allwithdrawtransaction) {
    return next(new errorHandler("Withdraw Transactoin not found ", 400));
  }

  res.status(200).json({
    success: true,
    allwithdrawtransaction,
  });
});

// TRANSACTION HISTORY -->
export const userTransactionHistory = catcherrors(async (req, res, next) => {
  const user_id = req.user._id;

  if (!user_id) {
    return next(new errorHandler("User ID not provided", 400));
  }

  // Fetch Deposit History and add 'task' field
  const depositHistory = (await Depositreq.find({ user: user_id })).map(
    (transaction) => ({
      ...transaction.toObject(),
      task: "deposit",
    })
  );

  // Fetch Withdrawal History and add 'task' field
  const withdrawHistory = (await Withdrawreq.find({ user_id })).map(
    (transaction) => ({
      ...transaction.toObject(),
      task: "withdraw",
    })
  );

  // Merge both histories into one array
  const combinedHistory = [...depositHistory, ...withdrawHistory];

  // Optionally, you can sort the combined array by date
  combinedHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!combinedHistory.length) {
    return next(new errorHandler("No transactions found", 404));
  }

  res.status(200).json({
    success: true,
    transactions: combinedHistory,
  });
});
