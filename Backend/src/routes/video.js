const adminMw = require("../middleware/adminMw");
const {genSignature,saveMetaData,deleteVideo} = require("../controllers/videoSection")

express = require("express");
const videoRouter = express.Router();

videoRouter.get("/create/:problemId",adminMw,genSignature);
videoRouter.post("/save",adminMw,saveMetaData);
videoRouter.delete("/delete/:problemId",adminMw,deleteVideo);

module.exports = videoRouter;