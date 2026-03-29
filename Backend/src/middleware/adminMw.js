const redisClient = require("../config/redis");
const jwt = require("jsonwebtoken");
const User = require("../models/user")

   

const adminMw = async(req,res,next)=>{
    try{
        const {token} = req.cookies;
        if(!token){
           throw new Error("Token is not present");
        }
        const payload = jwt.verify(token,process.env.JWT_KEY)
        const {_id} = payload;
        if(!_id){
            throw new Error("Invalid Token");

        }
        const result = await User.findById(_id);
        if(payload.role!="admin"){
            throw new Error("Invalid Token")
        }
        if(!result){
            throw new Error("User doesnt exist");

        }
        const isBlocked = await redisClient.exists(`token :${token}`);
        if(isBlocked){
            throw new Error("Invalid token")
        }
        req.result= result;
        next();
    }
    catch(err){
        console.log(err);
    }
}

module.exports = adminMw;