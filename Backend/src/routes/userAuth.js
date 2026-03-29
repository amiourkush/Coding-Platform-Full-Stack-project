const express = require("express");
const authRouter = express.Router();
const {register,login,logout,adminRegister,deleteProfile} = require("../controllers/userAuthent")
const tokenMw = require("../middleware/tokenMw")
const adminMw = require("../middleware/adminMw")


authRouter.post("/register",register)
authRouter.post("/login",login)
authRouter.post("/logout",tokenMw,logout)
authRouter.post("/admin/register",adminMw,adminRegister)
authRouter.post("/profile",tokenMw,deleteProfile);
// authRouter.get("/getProfile",getProfile)

module.exports=authRouter;