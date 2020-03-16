require('dotenv').config({path: __dirname + '/.env'})
const nodemailer = require("nodemailer");
const moment = require("moment");

const express = require('express')
const redis = require('kue/node_modules/redis');
const url = require('url');
const kue = require('kue');

const app = express();
app.redisClient = (function() {
  const redisUrl = url.parse(process.env['REDISCLOUD_URL']);
  const client = redis.createClient(redisUrl.port, redisUrl.hostname);
  if (redisUrl.auth) {
    client.auth(redisUrl.auth.split(":")[1]);
  }
  return client;
})()

app.redisClient.on('connect', function () {
  console.info('successful connection to redis server');
});

app.redisClient.on('error', function (err) {
  console.log('Redis error encountered', err);
});

app.redisClient.on('end', function() {
  console.log('Redis connection closed');
});

const queue = kue.createQueue({
  redis: {
      createClientFactory: function() {
          return app.redisClient;
      }
  }
});

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

const scheduleJob = data => {
  queue.createJob(data.jobName, data.params)
    .attempts(3)
    .delay(data.time - Date.now()) // relative to now.
    .save();
};

queue.process("sendReminder", async function(job, done) {
  let { data } = job;
  await smtpTransport.sendMail(data);
  done();
});

const set = (req) => {
  return new Promise ((resolve) => {
    const origin = req.get('origin');
    const email = req.body.email;
    const time = req.body.appointmentDate;
  
    if (origin == process.env['HOTM_APP_HOST']) {
  
      const params={
        to : email,
        subject : `Hair On The Move 2 U appointment reminder`,
        html : `<h3>Your appointment with Hair On The Move 2 U on ${time} is coming in 2 days. We look forward to serving you!</h3>`
      }
      
      const timeText = `${moment(time).format("dddd, YYYY/MM/DD")} ${moment(time).format('LT')}`
      // Schedule Job to send email 10 minutes before the movie
      args = {
        jobName: "sendReminder",
        time: (time - 48 * 60 * 60 * 1000), // (Booking time - 48 hours) in millieconds
        params: {
          to : email,
          subject : `Hair On The Move 2 U appointment reminder`,
          html : `<h3>Your appointment with Hair On The Move 2 U on ${timeText} is coming in 2 days. We look forward to serving you!</h3>`
        }
      };
      scheduleJob(args);
      
      resolve(`Reminder for appointment on ${timeText} will be sent to ${email}.`)
    }
  })
}

module.exports = {
  set
};