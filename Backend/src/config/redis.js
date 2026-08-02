const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-10581.crce286.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 10581
    }
});



module.exports = redisClient;




// const redisClient = createClient({
//     username: 'default',
//     password:  process.env.REDIS_PASS,
//     socket: {
//         host: 'redis-11216.crce292.ap-south-1-2.ec2.cloud.redislabs.com',
//         port: 11216
//     }
// });
