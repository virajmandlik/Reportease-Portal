// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// module.exports = (email, otp) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'Your OTP Code',
//     text: `Your OTP code is ${otp}`
//   };
//   return transporter.sendMail(mailOptions);
// };

// Load environment variables
require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  
  service: 'gmail', // Use Gmail service
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or App Password
  },
});

// Function to send OTP
module.exports = (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: email, // List of recipients
    subject: 'You have an OTP from Sashwat', // Subject line
    text: `Your OTP code is ${otp}`, // Plain text body
  };

  // Send the email and return the promise
  return transporter.sendMail(mailOptions)
    .then(info => {
      console.log('Email sent: ' + info.response);
      return info; // Return the info object for further processing if needed
    })
    .catch(error => {
      console.error('Error sending email:', error);
      throw error; // Rethrow the error for handling in the calling function
    });
};
