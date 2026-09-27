const express = require("express");
const submitRouter = express.Router();
const tokenMw = require("../middleware/tokenMw")
const {submitCode,runCode,submitHistory,checkSubmission} = require("../controllers/userSubmission");
const runLimiter = require("../middleware/runLimiter");
const submitLimiter = require("../middleware/submitLimiter");

submitRouter.post("/submit/:id",tokenMw,submitCode);
submitRouter.post("/run",tokenMw,runCode);
submitRouter.get("/submitHistory/:id",tokenMw,submitHistory);
submitRouter.get("/checkSubmission/:id",tokenMw,checkSubmission);


module.exports = submitRouter;