const nodemailer = require("nodemailer");

/*
  Here we are configuring our SMTP Server details.
  STMP is mail server which is responsible for sending and receiving email.
*/
const smtpTransport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env['GMAIL_USER'],
    pass: process.env['GMAIL_PASS']
  }
});

function generateCode() {
  let s = Math.floor(Math.random() * 1000000) + "";
  while (s.length < 6) s = "0" + s;
  return s;
}

const send = (req) => {
  return new Promise ((resolve, reject) => {
    const origin = req.get('origin');
    const email = req.body.email;
    //Generate a random 6 digits code to send to the email
    const code = generateCode()
  
    if (origin == process.env['HOTM_APP_HOST']) {
  
      const mailOptions={
        to : email,
        subject : `Hair On The Move 2 U confirmation code: ${code}`,
        html : `<h2>Confirm your email address</h2><p>Thank you for signing up for Hair On The Move 2 U. We're happy you're here!</p><p>Enter the following code in the pop up window where you registered for Hair On The Move 2 U</p><br>${code}`
      }
      
      smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
          reject(error)
        }

        resolve(code)
      });
    } 
  })
}

module.exports = {
  send
};
