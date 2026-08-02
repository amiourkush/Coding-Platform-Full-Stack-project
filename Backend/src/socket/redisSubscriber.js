const subscriber = require("../config/redisSubscriber");
const { getIO } = require("./socket");

subscriber.subscribe("submission-updates");

subscriber.on("message", (channel, message) => {

    if (channel === "submission-updates") {

        try {

            const data = JSON.parse(message);

            console.log("Redis Message:", data);

            const io = getIO();

            if (!io) {
                console.log(
                    "Socket.IO not initialized yet"
                );
                return;
            }

            if (!data.userId) {
                console.log(
                    "userId missing from submission update"
                );
                return;
            }

            io.to(data.userId).emit(
                "submission-updates",
                data
            );

            console.log(
                `Submission update sent to user ${data.userId}`
            );

        }
        catch (err) {

            console.error(
                "Redis subscriber error:",
                err.message
            );

        }

    }

});