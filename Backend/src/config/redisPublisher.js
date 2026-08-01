const { createClient } = require("redis");

const publisher = createClient({
    url: "redis://localhost:6379"
});

publisher.on("error", (err) => {
    console.log(err);
});

(async () => {
    await publisher.connect();
})();

module.exports = publisher;