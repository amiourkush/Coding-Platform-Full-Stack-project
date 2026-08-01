const Redis = require("ioredis");

const subscriber = new Redis({
    host: "localhost",
    port: 6379
});

module.exports = subscriber;