const redis = require('redis');
const util = require('util');
var redisClient = redis.createClient(); // using default

redisClient.on('error', function () {
    redisClient = undefined;
    console.log('Unable to connect to redis');
});
const redisGetAsync = util.promisify(redisClient.get).bind(redisClient);

var cacheMiddleWare = async (ctx, next) => {
    if (!redisClient) {
        await next();
        return;
    } 
    let cachedString = await redisGetAsync(ctx.url);
    if (cachedString) {
        ctx.response.status = 303;
        ctx.response.set('Location', cachedString);
        return;
    } 
    await next();
    let targetUrl = ctx.response.get('Location');
    // update cache
    if (targetUrl && ctx.status === 303) {
        console.log("update cache");
        redisClient.set(ctx.url, targetUrl, 'EX', 24 * 60 * 60 * 6);
    }
}

module.exports = cacheMiddleWare;