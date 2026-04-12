const redisClient = require("../config/redis");
const submission = require("../models/submission");
const User = require("../models/user");
const validate = require("../utils/validate")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



const register = async(req,res)=>{
    try{
        validate(req.body);
         const {firstName,emailId,password} = req.body;

         console.log(req.body);

         req.body.password= await bcrypt.hash(password,10);
         req.body.role="user";
         const user= await User.create(req.body);
        //  req.body.role ="user"
         const token = jwt.sign({_id :user._id,emailId:emailId,role:"user"},process.env.JWT_KEY,{expiresIn : 60*60})
          const reply = {
            firstName : user.firstName,
            emailId : user.emailId,
             _id : user._id,
             role: user.role
    }
        res.cookie("token",token,{maxAge:60*60*1000});
      //  res.status(200).send("Successfully Registered");
        res.status(200).json({
        user : reply,
        message : "Registered Successfully"
    });

    }
    catch(err){
          console.log("FULL ERROR",err);   
         res.status(400).json({
         message: err.message,
         error: err
    });
    }
}

const login =async(req,res)=>{

   try{
    const {emailId,password} = req.body;
    if(!emailId){
        throw new error("Invalid Credentials");
    }
    if(!password){
        throw new error("Invalid Credentials");
    }

    const user = await User.findOne({emailId});
    const match= bcrypt.compare(password,user.password);
    if(match==false){
        throw new error("Invalid Credentials");
    }
    const token = jwt.sign({_id:user._id,emailId:emailId,role:user.role},process.env.JWT_KEY,{expiresIn:60*60})
   const reply ={
        firstName : user.firstName,
        emailId : user.emailId,
        _id : user._id,
        role:user.role
    }
    res.cookie("token",token,{maxAge:60*60*1000})
    res.status(201).json({
        user : reply,
        message : "Logged In Successfully"
    });



   }
   catch(err){
    res.send("Error :"+err);
   }
}

const logout = async(req,res)=>{
    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);
        await redisClient.set(`token :${token}`,"blocked");
        await redisClient.expireAt(`token : ${token}`,payload.exp);
        
        res.cookie("token",null,{expires: new Date(Date.now())});
        res.send("Logged Out Successfully");

    }
    catch(err){
        res.send(err);
        
    }
}


const adminRegister = async(req,res)=>{
    try{
         validate(req.body);
         const {firstName,emailId,password} = req.body;

        //console.log(req.body)

         req.body.password= await bcrypt.hash(password,10);
         const user= await User.create(req.body);
         req.body.role ="admin"
         const token = jwt.sign({_id :user._id,emailId:emailId,role:"admin"},process.env.JWT_KEY,{expiresIn : 60*60})
         res.cookie("token",token,{maxAge:60*60*1000});
         res.status(201).send("User Registered Successfully")



    }
    catch(err){
        res.status(500).send(err);
    }
}

const deleteProfile = async(req,res)=>{
    try{
       const userId = req.result._id;
       await User.findByIdAndDelete(userId);
      // await submission.deleteMany({userId});   this code can also be used and also we can create post Schema in UserSchema in which if any user document is deleted , then automatically delete it from submission also.(for this go to user.js(in models))
       res.send("Profile Deleted");
    }catch(err){
        res.status(500).send("Server Error"+err);
    }
}




module.exports={register,login,logout,adminRegister,deleteProfile};