const redisClient = require("../config/redis");
const jwt = require("jsonwebtoken");
const User = require("../models/user")

   

const tokenMw = async(req,res,next)=>{
    try{
        const {token} = req.cookies;
        if(!token){
           return res.status(401).json({ message: "Token missing" });
        }
        const payload = jwt.verify(token,process.env.JWT_KEY)
        const {_id} = payload;
        if(!_id){
           return res.status(401).json({ message: "Id is missing" });

        }
        const result = await User.findById(_id);
        if(!result){
            return res.status(401).json({ message: "User dont exist" });

        }
        const isBlocked = await redisClient.exists(`token :${token}`);
        if(isBlocked){
            return res.status(401).json({ message: "Token missing" });
        }
        req.result= result;
        next();
    }
    catch(err){
         console.log(err.message);
    return res.status(401).json({
        message: err.message || "Unauthorized"
    });
    }
}

module.exports = tokenMw;