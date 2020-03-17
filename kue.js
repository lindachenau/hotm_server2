require('dotenv').config({path: __dirname + '/.env'})
const redis = require('kue/node_modules/redis');
const kue = require('kue');

const redisClient = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});

redisClient.on('connect', function () {
  console.info('successful connection to redis server');
});

redisClient.on('error', function (err) {
  console.log('Redis error encountered', err);
});

redisClient.on('end', function() {
  console.log('Redis connection closed');
});

const queue = kue.createQueue({
  redis: {
      createClientFactory: function() {
          return redisClient;
      }
  }
});

queue.on( 'error', function( err ) {
  console.log( 'Oops... ', err );
});

const scheduleJob = data => {
  queue.create(data.jobName, data.params)
    .attempts(3)
    .delay(data.time - Date.now()) // relative to now.
    .save();
};

module.exports = {
  scheduleJob
};