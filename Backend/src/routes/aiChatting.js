const express = require("express");
const aiRouter = express.Router();
const solveDoubt = require("../controllers/solveDoubt")

const tokenMw = require("../middleware/tokenMw")

aiRouter.post("/chat",tokenMw,solveDoubt); 

module.exports= aiRouter;