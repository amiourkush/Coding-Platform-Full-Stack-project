const subscriber = require("../config/redisSubscriber");
const { getIO } = require("./socket");

subscriber.subscribe("submission-updates");

subscriber.on("message", (channel, message) => {

    if(channel === "submission-updates"){

        const data = JSON.parse(message);

        console.log("Redis Message:", data);

       getIO.to(data.userid).emit("submission-updates",data);

    }

});