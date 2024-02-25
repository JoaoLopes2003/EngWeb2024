var http = require('http')
var fs = require('fs')
var url = require('url')

http.createServer(function (req, res) {
    var q = url.parse(req.url, true);
    var path = q.pathname.substring(1);
    if(path=="") {
        fs.readFile("html/index.html", function (erro, dados) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write(dados);
            res.end();
        })
    } else{
        fs.access("html" + q.pathname + ".html", fs.constants.F_OK, (err) => {
            if (!err) {
                fs.readFile("html" + q.pathname + ".html", function (erro, dados) {
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                    res.write(dados);
                    res.end();
                })
            } else {
                res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'})
                res.write('<h3>404: Page not found.</h3>')
                res.write('<pre>Page asked: ' + q.pathname + '</pre>')
                res.end()
            }
        });
    }
}).listen(7777);