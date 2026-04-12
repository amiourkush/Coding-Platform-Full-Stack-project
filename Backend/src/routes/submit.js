const express = require("express");
const submitRouter = express.Router();
const tokenMw = require("../middleware/tokenMw")
const {submitCode,runCode,submitHistory} = require("../controllers/userSubmission")

submitRouter.post("/submit/:id",tokenMw,submitCode);
submitRouter.post("/run/:id",tokenMw,runCode);
submitRouter.get("/submitHistory/:id",tokenMw,submitHistory);

module.exports = submitRouter;