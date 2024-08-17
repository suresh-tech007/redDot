 import { errorHandler } from "../utils/ErrorHandler.js";


const errormidleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if(err.name === "CastError"){
     message = `Resourcce not found . Invalid : ${err.path}`;
    err = new errorHandler(message,404)
  }
  if(err.code === 11000){
     message = `Duplicate ${Object.keys(err.keyValue)} Entered`
    err = new errorHandler(message,400)

  }
  if(err.name === "jsonWebTokenError"){
     message = ` Json Web Token is invalid , Try again `;
    err = new errorHandler(message,400)

  }
  if(err.name === "TokenExpiredError"){
     message = ` Json Web Token is Expired , Try again `;
    err = new errorHandler(message,400)

  }

  return res.status(statusCode).json({
    success: false,
    error: message
  })
}


export { errormidleware }