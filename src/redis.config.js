const redis = require("redis");
require('dotenv').config()
const {
    promisify
} = require("util");


//redis
//Connect to redis
const redisClient = redis.createClient(
    process.env.REDIS_PORT,
    process.env.REDIS_URL, {
        no_ready_check: true
    }
);
redisClient.auth(process.env.REDIS_PASS, function (err) {
    if (err) console.log("⚠️ ", err.message);
});

redisClient.on("connect", async function () {
    console.log("✅ Connected to Redis.");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

module.exports = {
    SET_ASYNC,
    GET_ASYNC
}