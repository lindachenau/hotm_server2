require('dotenv').config({path: __dirname + '/.env'})
const express = require('express');
const nodemailer = require("nodemailer");
const stripe = require("stripe")(process.env['REACT_APP_STRIPE_PRIVATE_KEY']);
const app = express();
app.use(require("body-parser").json());
app.use(express.json())

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}); 

app.post("/charge", async (req, res) => {
    try {
      let {status} = await stripe.charges.create({
        amount: req.body.amount,
        currency: "aud",
        description: req.body.description,
        source: req.body.id
      });
  
      res.json({status});
    } catch (err) {
      console.log(err);
      res.status(500).end();
    }
  });

/*
    Here we are configuring our SMTP Server details.
    STMP is mail server which is responsible for sending and receiving email.
*/
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env['GMAIL_USER'],
        pass: process.env['GMAIL_PASS']
    }
});

/*------------------SMTP Over-----------------------------*/

/*------------------Routing Started ------------------------*/

function generateCode() {
    let s = Math.floor(Math.random() * 1000000) + "";
    while (s.length < 6) s = "0" + s;
    return s;
}

app.post('/send',function(req,res) {
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
        console.log(mailOptions);

        smtpTransport.sendMail(mailOptions, function(error, response) {
            if (error) {
                console.log(error);
                res.status(500).json({error: error});
            } 
            else {
                console.log(`Code ${code} sent`);
                res.status(200).json({ code: code });
            }
        });
    } 
    else {
        res.end("Request is from unknown source");
    }
});

/*--------------------Routing Over----------------------------*/
const port = process.env.PORT || 9000
app.listen(port, () => {
    console.log(`Express Started on Port ${port}`);
});