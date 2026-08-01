const { Server } = require("socket.io");

let io;

function initSocket(server) {

  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true
    }
  });

  io.on("connection", (socket) => {

    console.log("Socket Connected:", socket.id);

    socket.on("join-user-room", (userId) => {

      socket.join(userId);

      console.log(
        `${socket.id} joined room ${userId}`
      );

    });

    socket.on("disconnect", () => {

      console.log("Socket Disconnected:", socket.id);

    });

  });

}

function getIO() {
  return io;
}

module.exports = {
  initSocket,
  getIO
};