const { createClient } =  require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-12890.crce217.ap-south-1-1.ec2.cloud.redislabs.com',
        port:12890
    }
});


module.exports = redisClient;
