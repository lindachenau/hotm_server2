const express = require('express');
const codesender = require("./codesender");
const reminder = require("./reminder");
const stripe = require("stripe")(process.env['REACT_APP_STRIPE_PRIVATE_KEY']);

const app = express();
app.use(require("body-parser").json());
app.use(express.json())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}); 

//Stripe charge server
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
    res.status(500).json({error: err});
  }
});

//Email confirmation server
app.post('/send', async (req, res) => {
  try {
    const code = await codesender.send(req);
    console.log(`Code ${code} sent`);
    res.status(200).json({ code: code });
  } catch (err) {
    console.error(err);
    res.status(500).json({error: err});
  }
});

//Reminder email server
app.post('/reminder', async (req, res) => {
  const message = await reminder.set(req);
  console.log(message);
  res.sendStatus(200);
});

/*--------------------Routing Over----------------------------*/
const port = process.env.PORT || 9000
app.listen(port, () => {
    console.log(`Express Started on Port ${port}`);
});