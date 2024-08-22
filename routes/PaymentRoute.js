import express from "express";
import { authorizeRoles, isAuthenicatedUser } from "../middleware/auth.js";
import {
   
  addbankaccount,
  addmoneyiswallet,
  allrequsetfordeposit,
  alluserrequsetfordeposit,
  AlluserswithdrawRequest,
  bonusController,
  getbankdetails,
  getUpiDetails,
  newUserdepositrequest,
  referUserdepositDetails,
  requsetfordeposit,
  updateWithdrawrequest,
  Upifordeposit,
  userAllwithdrawRequest,
  userTransactionHistory,
  walletbalance,
  withdrawRequest,
} from "../controlleres/Paymentcontroller.js";

const router = express.Router();

// DEPOSIT -->
router.post("/deposit", isAuthenicatedUser, requsetfordeposit);
router.get("/checknewuserdepositreq", isAuthenicatedUser, newUserdepositrequest);
router.get("/depositHistory", isAuthenicatedUser, alluserrequsetfordeposit);
router.get("/depositbonusforrefers", isAuthenicatedUser, bonusController);
router.get("/referUserDepositDetails", isAuthenicatedUser, referUserdepositDetails);
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
router.get("/admin/AlluserswithdrawRequest", isAuthenicatedUser,authorizeRoles("admin"),AlluserswithdrawRequest);
router.put("/admin/acceptWithdrawrequest", isAuthenicatedUser,authorizeRoles("admin"),updateWithdrawrequest);



router.get("/walletbalance", isAuthenicatedUser, walletbalance);

router.get("/userTransactionHistory", isAuthenicatedUser, userTransactionHistory);
router.get("/getUpiDetails", isAuthenicatedUser, getUpiDetails);

// THIS IS ONLY FOR ADMINS ROUTE -->
 
router.post("/admin/Upifordeposit", isAuthenicatedUser,authorizeRoles("admin"), Upifordeposit);
 

export default router;
