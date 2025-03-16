import { Wallet } from "../modules/Wallet.js";
import WingoResult from "../modules/Wingo/resultwingo.js";
import UserBet from "../modules/Wingo/UserBet.js";
import { errorHandler } from "../utils/ErrorHandler.js";

export const checkwinerUser = async (resultdata, bets) => {
  const betsCopy = JSON.parse(JSON.stringify(bets));
  const { timerType, Game_id,GameName, selectedNumber } = resultdata;

  const wingoresult = await WingoResult.create({
    timerType, Game_id,GameName, selectedNumber
  })

  if(!wingoresult){
    return new errorHandler("wingoresult does not created ! ", 405);
  }
  const winerUser = [];

 

  // Bets ko iterate karna
  betsCopy[timerType].forEach((bet) => {
    // console.log(betsCopy)
    
    if (Array.isArray(bet.selectednum)) {
      
    
      bet.selectednum.forEach((num) => {
         
        if (selectedNumber == num && bet.GameId == Game_id) {
         
          winerUser.push({
            userid: bet.userid,
            selectednumber: bet.selectednum,
            batleamount: bet.balance * bet.quantity,
            uniqueBatleId:bet.uniqueBatleId
          });
        }
      });
    } else {
      
         if (selectedNumber ==  bet.selectednum && bet.GameId == Game_id) {
       
        winerUser.push({
          userid: bet.userid,
          selectednumber: bet.selectednum,
          batleamount: bet.balance * bet.quantity,
          uniqueBatleId:bet.uniqueBatleId
        });
      }
    }
  });


  if (winerUser.length > 0   ) {
    for (const user of winerUser) {
              
      const { userid, batleamount, selectednumber, uniqueBatleId } = user;
     
      const useramount = await Wallet.findOne({ user_id: userid });
      

      if (!useramount) {
        return new errorHandler("Please Enter valid values", 405);
      }
    
      

      let withdrawamounts;
      if (Array.isArray(selectednumber)) {
        withdrawamounts = ((batleamount * 2) / 100) * 95;
      } else {
        withdrawamounts = ((batleamount * 10) / 100) * 90;
      }
      await UserBet.findOneAndUpdate(
        { userid, uniqueBatleId },
        {
          betstatus: "Win",
          win_amount: withdrawamounts,
        },
        { new: true }
      );
     await UserBet.updateMany(
        { GameId: Game_id, betstatus: "Pending" },  
        {
            $set: { betstatus: "Lose" },  
        },
        { new: true }  
    );
      
  
      await Wallet.findOneAndUpdate(
        { user_id: userid },
        { $inc: { withdrawableBalance: +withdrawamounts } },
        { new: true }
      );
    }

  }
  if(winerUser.length==0){
    await UserBet.updateMany(
      { GameId: Game_id, betstatus: "Pending" },  
      {
          $set: { betstatus: "Lose" },  
      },
      { new: true }  
  );
  }
};
