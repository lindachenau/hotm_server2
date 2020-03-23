const moment = require("moment");
const nodemailer = require("nodemailer");

const smtpTransport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env['GMAIL_USER'],
    pass: process.env['GMAIL_PASS']
  }
});

const set = (req) => {
  return new Promise ((resolve, reject) => {
    const origin = req.get('origin');
    const email = req.body.email;
    const time = new Date(req.body.appointmentDate);
  
    if (origin == process.env['HOTM_APP_HOST']) {
  
      const timeText = `${moment(time).format("dddd, YYYY/MM/DD")} ${moment(time).format('LT')}`
      // Schedule Job to send email 10 minutes before the movie
      
      const hrsBefore = parseInt(process.env['REMINDER_HOURS_BEFORE_APPOINTMENT']);
      const reminder = time - (hrsBefore * 3600000);
      const delay = reminder - Date.now();
      const params = {
        to : email,
        subject : `Hair On The Move 2 U appointment reminder`,
        html : `<h3>Your appointment with Hair On The Move 2 U on ${timeText} is coming in ${hrsBefore} hours. We look forward to serving you!</h3>`
      };
      //Don't send reminder if the appointment is before the default reminder advance time
      if (delay > 0) {
        const handle = setTimeout(() => {
          smtpTransport.sendMail(params);
          console.log('Reminder email sent');
          clearTimeout(handle);
        }, delay);
      }

      resolve(`Reminder for appointment on ${timeText} will be sent to ${email}.`)
    }
    else {
      reject('Unknown domain');
    }
  })
}

module.exports = {
  set
};