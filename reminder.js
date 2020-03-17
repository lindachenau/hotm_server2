const moment = require("moment");
const kue = require("./kue");
require("./worker");

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
      kue.scheduleJob(args);
      
      resolve(`Reminder for appointment on ${timeText} will be sent to ${email}.`)
    }
  })
}

module.exports = {
  set
};