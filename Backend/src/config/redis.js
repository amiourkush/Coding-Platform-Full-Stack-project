const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-19245.crce283.ap-south-1-2.ec2.cloud.redislabs.com',
        port: 19245
    }
});

module.exports = redisClient;