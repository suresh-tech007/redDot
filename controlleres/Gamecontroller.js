import catcherrors from "../middleware/catchAsyncError.js";
import User from "../modules/userModel.js";
import { Wallet } from "../modules/Wallet.js";
import WingoResult from "../modules/Wingo/resultwingo.js";
import UserBet from "../modules/Wingo/UserBet.js";
import { errorHandler } from "../utils/ErrorHandler.js";

 
export const userbet =catcherrors(async (req, res, next) => {

  
    const {
        uniqueBatleId,
        GameId ,
        userid ,
        GameName,
        selectedTimer, 
        balance,
        quantity,
        selectColor ,
        selectednum ,
        selected}=req.body;

        if( !uniqueBatleId ||  !GameId || !GameName ||  !userid || !selectedTimer || !balance || !quantity){
            return next(new errorHandler("Please Enter valid valuess", 405) );
        }
        if( !selectColor &&  !selectednum && !selected){
            return next(new errorHandler("Please Enter valid values", 405) );
        }

    const bet_amount =  balance * quantity ;
    let chosen_big = null
    if(selected =="Small"){
        chosen_big = false
        
    }
    else if(selected == "Big"){
        chosen_big = true
    }

    const UserBetle = await UserBet.create({
        uniqueBatleId,
        selectedTimer,
        bet_amount,
        GameId,
        GameName,
        userid,
        chosen_number:selectednum,
        chosen_color:selectColor,
        chosen_big

    })

    const wallet = await Wallet.findOne({ user_id: userid });

    if (!wallet) {
        throw new Error('Wallet not found');
    }

    let remainingAmount = bet_amount;

    // Pehle deposit balance se paisa kata
    if (wallet.depositBalance >= bet_amount) {
        wallet.depositBalance -= bet_amount;
        remainingAmount = 0;
    } else {
        // Deposit balance jitna ho utna kata
        remainingAmount -= wallet.depositBalance;
        wallet.depositBalance = 0;
    }

    // Agar deposit balance me paisa kam ho, to withdrawable balance se paisa kata
    if (remainingAmount > 0) {
        if (wallet.withdrawableBalance >= remainingAmount) {
            wallet.withdrawableBalance -= remainingAmount;
        } else {
            return next(new errorHandler('Insufficient funds', 405) );
             
        }
    }

    await wallet.save();

    res.status(200).json({
        success:true,
        UserBetle
    })


     

})


 
 
export const getresults = catcherrors(async (req, res, next) => {
    // Sabse pehle, game result history ko database se fetch karte hain
    const gameresulthistory = await WingoResult.find();

    if (!gameresulthistory) {
        return next(new errorHandler('Results not found!', 400));
    }

    // Pagination ke liye page aur pageSize ko query parameters se lete hain, agar nahi mile to default values set karte hain
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // Recent results ko sabse upar laney ke liye array ko reverse karte hain
    const sortedResults = gameresulthistory.reverse();

    // Pagination logic: start aur end index calculate karte hain
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    // Given page ke liye results nikalte hain
    const paginatedResults = sortedResults.slice(startIndex, endIndex);

    // Total number of pages calculate karte hain
    const totalResults = sortedResults.length;
    const totalPages = Math.ceil(totalResults / pageSize);

    // Paginated results ko response mein bhejte hain
    res.status(200).json({
        success: true,
        currentPage: page,
        totalPages: totalPages,
        resultsPerPage: pageSize,
        totalResults: totalResults,
        results: paginatedResults,
    });
});



export const UserGameHistory = catcherrors(async (req,res,next)=>{

   const userid =   req.user._id;
    const gamehistory = await UserBet.find({userid})

    if(!gamehistory){
        res.status(200).json({
            success:true,
            
        })
    
        return next(new errorHandler('results not found!', 400) );
    }

    res.status(200).json({
        success:true,
        gamehistory
    })


})


