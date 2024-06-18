var jwt = require('jsonwebtoken');

module.exports.verificaAcesso = function (req, res, next) {
    // Extrai os cookies
    var cookies = req.headers.cookie.split(';').map(cookie => cookie.trim());
    
    // Encontra o cookie
    var tokenCookie = cookies.find(cookie => cookie.startsWith('token='));

    if (tokenCookie) {
        // Remove o "token="
        tokenCookie = tokenCookie.replace("token=", "");   
    } else {
        res.status(401).jsonp({ error: "Token inexistente!" });
    }

    console.log(tokenCookie);
    if (tokenCookie) {
        jwt.verify(tokenCookie, "EngWeb2024", function(e, payload) {
            if (e) {
                res.status(401).jsonp({ error: e });
            } else {
                console.log(payload);
                req.username = payload.username;
                req.role = payload.role;
                next();
            }
        });
    } else {
        res.status(401).jsonp({ error: "Token inexistente!" });
    }
};
