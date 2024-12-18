
import express from "express";
import { errormidleware } from "./middleware/error.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import dotenv from 'dotenv';
import userRoute from "./routes/userRoute.js"
import cors from "cors";
import PaymentRouter from "./routes/PaymentRoute.js";
import GameRouter from "./routes/GamesRoute.js";
 



 

//  Config ==>
if (process.env.NODE_ENV !== 'PRODUCTION') {
    dotenv.config({ path: 'backend/config/.env' });
}

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors({
    origin:   "https://reddotreal.netlify.app",
    // origin:   "http://localhost:5173",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
})); 
    

app.use("/api/v1", userRoute);
app.use("/api/v1", PaymentRouter);
app.use("/api/v1", GameRouter);
app.use(errormidleware);

 
 
 
 

 

export default app;


















// import express from "express"
// import {errormidleware} from "./middleware/error.js"
// import cookieParser from "cookie-parser"
// import bodyParser from "body-parser";
// import fileUpload from "express-fileupload"
// import dotenv from 'dotenv';
// import { fileURLToPath } from "url";
// import path from "path"
// import cors from "cors"
 
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
 
// //  Config ==>
//     if (process.env.NODE_ENV !== 'PRODUCTION') {
//         dotenv.config({ path: 'backed/config/.env' });
//     }
    


// const app = express()
// app.use(express.json())
// app.use(cookieParser())
// app.use(bodyParser.urlencoded({extended:true}))
// app.use(fileUpload())
// app.use(cors({
//     origin: 'https://mern-stack-eccomerce-suresh.netlify.app', // Your frontend URL
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true,
// }));
  
// // Route Import 
// import product from "./routes/productRoute.js";
// import userRoute from "./routes/userRoute.js"
// import order from "./routes/orderRoute.js"
// import payment from "./routes/paymentRoute.js"
 



// app.use("/api/v1",product)
// app.use("/api/v1",userRoute)
// app.use("/api/v1",order)
// app.use("/api/v1",payment) 
// app.use(errormidleware)

// export default app; 