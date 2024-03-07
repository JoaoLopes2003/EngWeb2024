// alunos_server.js
// EW2024 : 04/03/2024
// by jcr

var http = require('http')
var axios = require('axios')
const { parse } = require('querystring');

var templates = require('./templates')          // Necessario criar e colocar na mesma pasta
var static = require('./static.js')             // Colocar na mesma pasta

// Aux functions
function collectRequestBodyData(request, callback) {
    if(request.headers['content-type'] === 'application/x-www-form-urlencoded') {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}

// Server creation

var musicaServer = http.createServer((req, res) => {
    var d = new Date().toISOString().substring(0, 16)
    console.log(req.method + " " + req.url + " " + d)

    // Handling request
    if(static.staticResource(req)){
        static.serveStaticResource(req, res)
    }
    else{
        switch(req.method){
            case "GET":
                
                // GET /compositores --------------------------------------------------------------------
                if(req.url == '/compositores') {
                    axios.get('http://localhost:3000/compositores')
                    .then( compositores => {
                        axios.get('http://localhost:3000/periodos')
                        .then( periodos => {
                            res.writeHead(200, {'Content-Type': 'text/html'})
                            res.end(templates.compositoresListPage(compositores.data, periodos.data, d))
                        })
                    })
                    .catch( erro => {
                        res.writeHead(520, {'Content-Type': 'text/html'})
                        res.end(templates.errorPage(erro, d))
                })}

                // GET /compositores/registo --------------------------------------------------------------------
                else if (req.url == '/compositores/registo') {
                    axios.get('http://localhost:3000/periodos')
                    .then( resposta => {
                        res.writeHead(200, {'Content-Type': 'text/html'})
                        res.end(templates.compositorFormPage(resposta.data, d))
                    })
                    .catch( erro => {
                        res.writeHead(520, {'Content-Type': 'text/html'})
                        res.end(templates.errorPage(erro, d))
                    })
                }

                // GET /compositores/edit/:id --------------------------------------------------------------------
                else if (/\/compositores\/edit\/[a-zA-Z0-9]+/.test(req.url)) {
                    var partes = req.url.split('/')
                    var idcompositor = partes[partes.length - 1]
                    axios.get('http://localhost:3000/periodos')
                    .then( periodos => {
                        axios.get('http://localhost:3000/compositores/' + idcompositor)
                        .then( compositor => {
                            res.writeHead(200, {'Content-Type': 'text/html'})
                            res.end(templates.compositorFormEditPage(compositor.data, periodos.data, d))
                        })
                    })
                    .catch( erro => {
                        res.writeHead(520, {'Content-Type': 'text/html'})
                        res.end(templates.errorPage(erro, d))
                    })
                }

                // /compositores/delete/:id --------------------------------------------------------------------
                else if (/\/compositores\/delete\/[a-zA-Z0-9]+/.test(req.url)) {
                    var partes = req.url.split('/')
                    var idcompositor = partes[partes.length - 1]
                    axios.delete('http://localhost:3000/compositores/' + idcompositor)
                    .then( resposta => {
                        res.writeHead(200, {'Content-Type': 'text/html'})
                        res.end(`<pre>${JSON.stringify(resposta.data)}</pre>`)
                    })
                    .catch ( erro => {
                        res.writeHead(521, {'Content-Type': 'text/html'})
                        res.end(templates.errorPage(erro, d))
                    })
                }

                // GET /compositores/:id --------------------------------------------------------------------
                else if (/\/compositores\/[a-zA-Z0-9]+/.test(req.url)) {
                    axios.get('http://localhost:3000' + req.url)
                    .then( compositor => {
                        axios.get('http://localhost:3000/periodos/' + compositor.data.periodo)
                        .then( periodo => {
                            res.writeHead(200, {'Content-Type': 'text/html'})
                            res.end(templates.compositorPage(compositor.data, periodo.data, d))
                        })
                    })
                    .catch( erro => {
                        res.writeHead(520, {'Content-Type': 'text/html'})
                        res.end(templates.errorPage(erro, d))
                    })
                }

                // GET /periodos --------------------------------------------------------------------
                else if(req.url == '/periodos') {
                    axios.get('http://localhost:3000/periodos')
                    .then( resposta => {
                        res.writeHead(200, {'Content-Type': 'text/html'})
                        res.end(templates.periodosListPage(resposta.data, d))
                    })
                    .catch( erro => {
                        res.writeHead(520, {'Content-Type': 'text/html'})
                        res.end(templates.errorPagePeriodos(erro, d))
                })}

                // GET /periodos/registo --------------------------------------------------------------------
                else if (req.url == '/periodos/registo') {
                    res.writeHead(200, {'Content-Type': 'text/html'})
                    res.end(templates.periodoFormPage(d))
                }

                // GET /periodos/edit/:id --------------------------------------------------------------------
                else if (/\/periodos\/edit\/[a-zA-Z0-9]+/.test(req.url)) {
                    var partes = req.url.split('/')
                    var idperiodo = partes[partes.length - 1]
                    axios.get('http://localhost:3000/periodos/' + idperiodo)
                    .then( periodo => {
                        res.writeHead(200, {'Content-Type': 'text/html'})
                        res.end(templates.periodoFormEditPage(periodo.data, d))
                    })
                    .catch( erro => {
                        res.writeHead(520, {'Content-Type': 'text/html'})
                        res.end(templates.errorPagePeriodos(erro, d))
                    })
                }

                // /periodos/delete/:id --------------------------------------------------------------------
                else if (/\/periodos\/delete\/[a-zA-Z0-9]+/.test(req.url)) {
                    var partes = req.url.split('/')
                    var idperiodo = partes[partes.length - 1]
                    axios.get('http://localhost:3000/periodos/' + idperiodo)
                    .then( periodo => {
                        if (periodo.data.compositores.length == 0) {
                            axios.delete('http://localhost:3000/periodos/' + idperiodo)
                            .then( resposta => {
                                res.writeHead(200, {'Content-Type': 'text/html'})
                                res.end(`<pre>${JSON.stringify(resposta.data)}</pre>`)
                            })
                        } else {
                            res.writeHead(522, {'Content-Type': 'text/html'})
                            res.end(templates.errorPagePeriodos("Não é possível apagar, pois há compositores associados ao período.", d))
                        }
                    })
                    .catch ( erro => {
                        res.writeHead(521, {'Content-Type': 'text/html'})
                        res.end(templates.errorPagePeriodos(erro, d))
                    })
                }

                // GET /periodos/:id --------------------------------------------------------------------
                else if (/\/periodos\/[a-zA-Z0-9]+/.test(req.url)) {
                    axios.get('http://localhost:3000' + req.url)
                    .then( periodo => {
                        axios.get('http://localhost:3000/compositores?periodo=' + periodo.data.id)
                        .then( compositores => {
                            res.writeHead(200, {'Content-Type': 'text/html'})
                            res.end(templates.periodoPage(periodo.data, compositores.data, d))
                        })
                    })
                    .catch( erro => {
                        res.writeHead(520, {'Content-Type': 'text/html'})
                        res.end(templates.errorPage(erro, d))
                    })
                }
                
                // GET ? -> Lancar um erro
                else {
                    res.writeHead(404, {'Content-Type': 'text/html'})
                    res.end(templates.errorPage(`Pedido GET não suportado: ${req.url}`, d))
                }
                break
            case "POST":

                // POST /compositores/registo --------------------------------------------------------------------
                if (req.url == '/compositores/registo') {
                    collectRequestBodyData(req, result => {
                        if (result) {
                            axios.post("http://localhost:3000/compositores", result)
                            .then( resposta1 => {
                                axios.get("http://localhost:3000/periodos/" + resposta1.data.periodo)
                                .then( resposta2 => {
                                    resposta2.data.compositores.push(resposta1.data.id)
                                    axios.put("http://localhost:3000/periodos/" + resposta1.data.periodo, resposta2.data)
                                    .then( resposta => {
                                        res.writeHead(200, {'Content-Type': 'text/html'})
                                        res.end(templates.compositorPage(resposta1.data, resposta2.data, d))
                                    })
                                })
                            })
                            .catch( erro => {
                                res.writeHead(502, {'Content-Type': 'text/html'})
                                res.end(templates.errorPage(erro, d))
                            })
                        }
                        else {
                            res.writeHead(201, {'Content-Type': 'text/html;charset=utf-8'})
                            res.write("<p>Unable to collect data from body...</p>")
                            res.end()
                        }
                    })
                }

                // POST /compositores/edit/:id --------------------------------------------------------------------
                else if (/\/compositores\/edit\/[a-zA-Z0-9]+/.test(req.url)) {
                    var partes = req.url.split('/')
                    var idcompositor = partes[partes.length - 1]
                    collectRequestBodyData(req, result => {
                        if (result) {
                            axios.get("http://localhost:3000/compositores/" + idcompositor)
                            .then( compositor_antes => {
                                if (result.periodo != compositor_antes.data.periodo) {
                                    axios.put("http://localhost:3000/compositores/" + idcompositor, result)
                                    .then ( compositor_depois => {
                                        axios.get("http://localhost:3000/periodos/" + compositor_antes.data.periodo)
                                        .then ( lista_periodo_antes => {
                                            lista_periodo_antes.data.compositores = lista_periodo_antes.data.compositores.filter(function(element) {
                                                return element !== idcompositor;
                                            });
                                            axios.put("http://localhost:3000/periodos/" + compositor_antes.data.periodo, lista_periodo_antes.data)
                                            .then( resposta => {
                                                axios.get("http://localhost:3000/periodos/" + compositor_depois.data.periodo)
                                                .then ( lista_periodo_antes => {
                                                    lista_periodo_antes.data.compositores.push(compositor_depois.data.id)
                                                    axios.put("http://localhost:3000/periodos/" + compositor_depois.data.periodo, lista_periodo_antes.data)
                                                    .then( resposta => {
                                                        res.writeHead(200, {'Content-Type': 'text/html'})
                                                        res.end(templates.compositorPage(compositor_depois.data, resposta.data, d))
                                                    })
                                                })
                                            })
                                        })
                                    })
                                } else {
                                    axios.get("http://localhost:3000/periodos/" + result.periodo)
                                    .then ( periodo => {
                                        axios.put("http://localhost:3000/compositores/" + idcompositor, result)
                                        .then ( resposta => {
                                            res.writeHead(200, {'Content-Type': 'text/html'})
                                            res.end(templates.compositorPage(resposta.data, periodo.data, d))
                                        })
                                    })
                                    
                                }
                            })
                            .catch( erro => {
                                res.writeHead(502, {'Content-Type': 'text/html'})
                                res.end(templates.errorPage(erro, d))
                            })
                        }
                        else {
                            res.writeHead(201, {'Content-Type': 'text/html;charset=utf-8'})
                            res.write("<p>Unable to collect data from body...</p>")
                            res.end()
                        }
                    })
                }

                // POST /periodos/registo --------------------------------------------------------------------
                else if (req.url == '/periodos/registo') {
                    collectRequestBodyData(req, result => {
                        if (result) {
                            axios.get("http://localhost:3000/periodos")
                            .then( periodos => {
                                var id = 0
                                for(let i=0; i < periodos.data.length ; i++) {
                                    if (periodos.data[i].id > id) {
                                        id = periodos.data[i].id
                                    }
                                }
                                result.id = (parseInt(id) + 1) + "";
                                result.compositores = [];
                                axios.post("http://localhost:3000/periodos", result)
                                .then( periodo => {
                                    res.writeHead(200, {'Content-Type': 'text/html'})
                                    res.end(templates.periodoPage(periodo.data, [], d))
                                })
                            })
                            .catch( erro => {
                                res.writeHead(502, {'Content-Type': 'text/html'})
                                res.end(templates.errorPagePeriodos(erro, d))
                            })
                        }
                        else {
                            res.writeHead(201, {'Content-Type': 'text/html;charset=utf-8'})
                            res.write("<p>Unable to collect data from body...</p>")
                            res.end()
                        }
                    })
                }

                // POST /periodos/edit/:id --------------------------------------------------------------------
                else if (/\/periodos\/edit\/[a-zA-Z0-9]+/.test(req.url)) {
                    var partes = req.url.split('/')
                    var idperiodo = partes[partes.length - 1]
                    collectRequestBodyData(req, result => {
                        if (result) {
                            axios.get("http://localhost:3000/periodos/" + result.id)
                            .then( periodo_antes => {
                                periodo_antes.data.nome = result.nome
                                axios.get('http://localhost:3000/compositores?periodo=' + result.id)
                                .then( compositores => {
                                    axios.put("http://localhost:3000/periodos/" + result.id, periodo_antes.data)
                                    .then ( periodo => {
                                        res.writeHead(200, {'Content-Type': 'text/html'})
                                        res.end(templates.periodoPage(periodo.data, compositores.data, d))
                                    })
                                })
                            })
                            .catch( erro => {
                                res.writeHead(502, {'Content-Type': 'text/html'})
                                res.end(templates.errorPagePeriodos(erro, d))
                            })
                        }
                        else {
                            res.writeHead(201, {'Content-Type': 'text/html;charset=utf-8'})
                            res.write("<p>Unable to collect data from body...</p>")
                            res.end()
                        }
                    })
                }

                else {
                    res.writeHead(404, {'Content-Type': 'text/html'})
                    res.end(templates.errorPage(`Pedido POST não suportado: ${req.url}`, d))
                }
            default:
                // Outros metodos nao sao suportados
        }
    }
})

musicaServer.listen(7777, ()=>{
    console.log("Servidor à escuta na porta 7777...")
})