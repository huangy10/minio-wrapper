const UrlParser = require('url-parse');
const domainSuffix = process.platform === "linux" ? 
    ".codewoody.com" : "localhost:3000";
    

var accessMiddleWare = async (ctx, next) => {
    let referer = ctx.request.get('Referer');
    var originHost = ctx.host;
    if (referer) {
        originHost = new UrlParser(referer).host;
    }
    if (originHost.endsWith(domainSuffix)) {
        await next();
    } else {
        ctx.response.status = 402;
        ctx.body = "Not allowed to access";
    }
}

module.exports = accessMiddleWare;