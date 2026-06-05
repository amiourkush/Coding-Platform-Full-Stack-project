const express = require("express");
const codeRouter = express.Router();
const tokenMw = require("../middleware/tokenMw");
const {autoSave,getCode} = require("../controllers/autoSave");

codeRouter.post("/autosave/:problemId",tokenMw,autoSave);
codeRouter.get("/getsavedcode/:problemId",tokenMw,getCode);

module.exports= codeRouter;