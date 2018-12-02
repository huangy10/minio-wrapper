const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const Minio = require("minio");
const fs = require('fs');
var yaml = require('js-yaml');
const cacheMiddleWare = require("./middleware/cache");
const accessMiddleWare = require("./middleware/access");

var minioClient =
    new Minio.Client(yaml.safeLoad(fs.readFileSync(__dirname + "/minio_key.yml", 'utf8')));

const app = new Koa();

app.use(logger());
app.use(accessMiddleWare);
app.use(cacheMiddleWare);

const router = new Router();
router.get('/query', async (ctx) => {
    console.log("query!");
    var bucket = ctx.query["bucket"];
    var resName = ctx.query["resname"];
    if (!bucket || !resName) {
        ctx.response.status = 404;
        ctx.response.body = "bucket and resource name must be provided!\n";
        return;
    }
    try {
        var targetUrl = await minioClient.presignedGetObject(bucket, resName);
        console.log("Get: " + targetUrl);
    } catch (err) {
        console.log(err);
        ctx.response.status = 500
        ctx.response.body = "Fail to access storage";
        return;
    }
    ctx.response.status = 303;
    ctx.response.set('Location', targetUrl);
});

app.use(router.routes());

app.use(router.allowedMethods());

app.listen(3000);
