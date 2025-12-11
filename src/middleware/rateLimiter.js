const redisClient = require("../config/redis");

const submitCodeRateLimiter = async (req,res,next) =>{
    const userId = req.result._id;
    const redisKey = `submit_cooldown:${userId}`;

    try {
        //check user has a recent submission 
        const exist = await redisClient.exists(redisKey);
        if(exist){
            res.status(429).json({
                error: "Please wait 10 seconds before submitting again"
            });
        }

        //set_cooldown period
        await redisClient.set(redisKey,'cooldown_active',{
            EX:10, // Expire after 10 seconds
            NX: true // Only set If it is not exists
        });

        next();
    } catch (error) {
        console.error("Rate Limit Error: "+error);
        res.status(500).json({error:'Internal server error'});
    }
}

module.exports = submitCodeRateLimiter;