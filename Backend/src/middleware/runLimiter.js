const redis = require("../config/redisDocker");

const runLimiter = async(req,res,next)=>
{
    try{
    const userId = req.result._id.toString();
    const key = `run:${userId}`;

    const windowSize = 60*1000;
    const maxRequest =10;
    const now = Date.now();
    await redis.zremrangebyscore(key,0,now-windowSize);

    const count = await redis.zcard(key);
    if(count>=maxRequest){
              return res.status(429).json({
                success:false,
                message:"Limit Exceeded,Try after some time"
              }) 
    }

    await redis.zadd(key,now,`${now}-${Math.random()}`);
    await redis.expire(key,60);
    next();
}catch(err){
    console.log("Error in RunLimiter :",err);
    return res.status(500).json({
        success:false,
        message:"RunTime failure"
    })
}
}

module.exports = runLimiter;






// const runRateLimiter =
// async(req,res,next)=>{

//    const userId =
//    req.result._id;

//    const key =
//    `run:${userId}`;

//    const currentCount =
//    await redis.incr(key);

//    if(currentCount === 1){
//       await redis.expire(
//          key,
//          60
//       );
//    }

//    if(currentCount > 10){

//       return res.status(429)
//       .json({
//          success:false,
//          message:
//          "Run limit exceeded"
//       });

//    }

//    next();

// };

// module.exports =
// runRateLimiter;