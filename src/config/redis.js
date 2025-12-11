const { createClient } =  require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-15872.crce179.ap-south-1-1.ec2.cloud.redislabs.com',
        port:15872
    }
});


module.exports = redisClient;
