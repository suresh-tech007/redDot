  
import nodemailer from "nodemailer";
import { errorHandler } from "./ErrorHandler.js";

const sendEmail = async ({options,next}) => {
   
    const auth = nodemailer.createTransport({
      service: process.env.SMPT_HOST,
      secure: true,
      port: process.env.SMPT_PO,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },
    });

    const receiver = {
      from: process.env.SMPT_MAIL,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    await auth.sendMail(receiver, (error, emailResponse ,next) => {
      if (error) {return next(new errorHandler(error.message, 500))}
      console.log("success");
      res.end();
    });
   
};

export { sendEmail };


 


// const sendEmail = async (options)=>{
//     const transporter = nodeMailer.createTransport(
//         {
//             service:process.env.SMPT_SERVICE,
//             auth:{
//                 user:process.env.SMPT_MAIL,
//                 pass:process.env.SMPT_PASSWORD
//             }
//         }
//     )

//     const mailOptions= {
//         from : process.env.SMPT_MAIL,
//         to:options.email,
//         subject:options.subject,
//         textl:options.message

//     }

//     await transporter.sendMail(mailOptions)
// }


// import emailjs from '@emailjs/browser';
// const sendEmail = async (options)=>{
//     emailjs.send("service_4nub5hu","template_t7ycawa",options,{
//         publicKey: 'EDeAR7R-id6ZX9GSt',
//       })
//       .then(
//         () => {
//           console.log('SUCCESS!');
//         },
//         (error) => {
//           console.log('FAILED...', error.text);
//         },
//     )

// }

// export {sendEmail}
