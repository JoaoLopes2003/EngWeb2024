var http = require('http')
var fs = require('fs')
var url = require('url')

http.createServer(function (req, res) {
    var regex = /^c\d+$/
    var q = url.parse(req.url, true);
    var path = q.pathname.substring(1);
    console.log("query: " + q);
    console.log("path: " + path);
    console.log("pathname: " + q.pathname.substring(1));
    if(path=="") {
        fs.readFile("html/index.html", function (erro, dados) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write(dados);
            res.end();
        })
    } else if (regex.test(path)) {
        fs.readFile("html" + q.pathname + ".html", function (erro, dados) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write(dados);
            res.end();
        })
    } else {
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'})
        res.write('<p>Erro: Page not found.</p>')
        res.write('<pre>' + q.pathname + '</pre>')
        res.end()
    }
}).listen(7777);