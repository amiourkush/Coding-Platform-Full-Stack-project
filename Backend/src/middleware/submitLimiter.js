const redis = require("../config/redisDocker");

const submitLimiter =
async(req,res,next)=>{

    try{

        const userId =
        req.result._id.toString();

        const key =
        `submit:${userId}`;

        const now =
        Date.now();

        const windowSize =
        60 * 60 * 1000;

        const maxRequests =
        30;

        await redis.zremrangebyscore(
            key,
            0,
            now - windowSize
        );

        const count =
        await redis.zcard(key);

        if(count >= maxRequests){

            return res.status(429)
            .json({
                success:false,
                message:
                "Submission limit exceeded. Try again later."
            });

        }

        await redis.zadd(
            key,
            now,
            `${now}-${Math.random()}`
        );

        await redis.expire(
            key,
            3600
        );

        next();

    }
    catch(err){

        console.log(err);

        return res.status(500)
        .json({
            success:false,
            message:
            "Rate limiter error"
        });

    }

}

module.exports =
submitLimiter;