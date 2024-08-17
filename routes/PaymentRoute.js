import express from "express";
import { authorizeRoles, isAuthenicatedUser } from "../middleware/auth.js";
import {
  addbankaccount,
  addmoneyiswallet,
  allrequsetfordeposit,
  alluserrequsetfordeposit,
  getbankdetails,
  requsetfordeposit,
  userAllwithdrawRequest,
  usersAllwithdrawRequest,
  userTransactionHistory,
  walletbalance,
  withdrawRequest,
} from "../controlleres/Paymentcontroller.js";

const router = express.Router();

// DEPOSIT -->
router.post("/deposit", isAuthenicatedUser, requsetfordeposit);
router.get("/depositHistory", isAuthenicatedUser, alluserrequsetfordeposit);
// FOR ADMIN
router.get("/alldepositrequests", isAuthenicatedUser,authorizeRoles("admin"), allrequsetfordeposit);

// ADD MONEY IN USER ACCOUNT FOR ADMIN
router.post("/addMoneyUserWallet", isAuthenicatedUser,authorizeRoles("admin"), addmoneyiswallet);


router.post("/addbankaccount", isAuthenicatedUser, addbankaccount);
router.get("/getBankdetails", isAuthenicatedUser, getbankdetails);

// WITHDRAW -->
router.post("/withdrawRequest", isAuthenicatedUser, withdrawRequest);
router.get("/withdrawHistory", isAuthenicatedUser, userAllwithdrawRequest);
// WITHDRAW REQUEST FOR ADMIN
router.post("/allwithdrawrequest", isAuthenicatedUser,authorizeRoles("admin"), usersAllwithdrawRequest);



router.get("/walletbalance", isAuthenicatedUser, walletbalance);

router.get("/userTransactionHistory", isAuthenicatedUser, userTransactionHistory);
 

export default router;
