const { Queue } = require("bullmq");

const executionQueue = new Queue("execution", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

module.exports = executionQueue;