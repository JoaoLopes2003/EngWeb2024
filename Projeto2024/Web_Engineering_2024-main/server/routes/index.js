var express = require('express');
var router = express.Router();
var multer = require('multer');
const math = require('mathjs');
var upload = multer({dest: 'uploads'});
var Recurso = require('../controllers/recurso');
var TipoRecurso = require('../controllers/tipoRecurso');
var auth = require('../auth/auth');
const path = require('path');

var User = require('../controllers/user');
const AdmZip = require('adm-zip');
const fs = require('fs');
const recurso = require('../models/recurso');

/* Redirect para a página de login */

router.get('/', function(req, res) {
  res.redirect('/login')
});

// Download de ficheiros

router.get('/download/:id', auth.verificaAcesso, function(req, res) {

  Recurso.findById(req.params.id)
  .then(recurso => {
    var file = __dirname + '/../FileStore/Recursos/' + recurso.fileName
    console.log(file)
    
    if (req.role == 'admin' || req.username == recurso.autor || recurso.visibilidade === 'publico') {
      res.download(file)
    } else {
      res.render('error', {error: 'Não tem permissões para aceder a esta página.', message: 'Não tem permissões para aceder a este recurso.'})
    }
  })
  .catch(erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar o recurso.'})
  })
})

/* GET lista de recursos em formato JSON */

router.get('/recursos', auth.verificaAcesso,function(req, res) {
  var d = new Date().toISOString().substring(0, 16)

  // Verifica se existem filtros na query string
  if (Object.keys(req.query).length === 0) {
    Recurso.list()
    .then(dados => {
      TipoRecurso.list()
      .then(tipos => {
        if (req.role == 'admin') {
          res.render('recursos', {recursos: dados, data: d, titulo: 'Recursos Disponíveis', tipos: tipos, userRole: req.role, username: req.username})
        } else {
          dados = dados.filter(recurso => recurso.visibilidade === 'publico')
          res.render('recursos', {recursos: dados, data: d, titulo: 'Recursos Disponíveis', tipos: tipos, userRole: req.role, username: req.username})
        }
      })
      .catch(erro => {
        res.render('error', {error: erro, message: 'Erro ao recuperar tipos de recursos'})
      })
    })
    .catch(erro => {
      res.render('error', {error: erro, message: 'Erro ao recuperar recursos'})
    })
  } else {
    const filters = {
      tipo: req.query.tipo || '',
      dataCriacao: req.query.dataCriacao || null,
      dataRegisto: req.query.dataRegisto || null,
      tema: req.query.tema || '',
      titulo: req.query.titulo || '',
      subtitulo: req.query.subtitulo || '',
      autor: req.query.autor || '',
      rankingMin: req.query.rankingMin ? parseFloat(req.query.rankingMin) : 0,
      rankingMax: req.query.rankingMax ? parseFloat(req.query.rankingMax) : 5,
      sortAttribute: req.query.sortAttribute || 'dataRegisto',
    };

    if (req.query.sortOrder === 'asc') {
      filters.order = 1;
    } else if (req.query.sortOrder === 'desc') {
      filters.order = -1;
    } else {
      filters.order = -1;
    }

    Recurso.listByFilters(filters.tipo, filters.dataCriacao, filters.dataRegisto, filters.tema, filters.titulo, filters.subtitulo, filters.autor, filters.rankingMin, filters.rankingMax, filters.sortAttribute, filters.order)
    .then(dados => {
      TipoRecurso.list()
      .then(tipos => {
        if (req.role == 'admin') {
          res.render('recursos', {recursos: dados, data: d, titulo: 'Recursos Disponíveis', tipos: tipos, userRole: req.role, username: req.username})
        } else {
          dados = dados.filter(recurso => recurso.visibilidade === 'publico')
          res.render('recursos', {recursos: dados, data: d, titulo: 'Recursos Disponíveis', tipos: tipos, userRole: req.role, username: req.username})
        }
      })
      .catch(erro => {
        res.render('error', {error: erro, message: 'Erro ao recuperar tipos de recursos'})
      })
    })
    .catch(erro => {
      res.render('error', {error: erro, message: 'Erro ao recuperar recursos'})
    })
  }
});

/* GET recurso por id */

router.get('/recursos/:id', auth.verificaAcesso,function(req, res) {
  var d = new Date().toISOString().substring(0, 16)

  // Verifica se o id começa com #
  if(req.params.id.charAt(0) !== '#') {
    console.log(req.params.id)
    Recurso.listByFilters(req.params.id, null, null, '', '', '', '', null, null, 'dataRegisto', -1)
    .then(dados => {
      TipoRecurso.findById(req.params.id)
      .then(tipo => {
        if (req.role == 'admin') {
          res.render('recursoPorTipo', {tipo, tipo, recursos: dados, data: d, titulo: 'Recursos do tipo "' + req.params.id + '" Disponíveis', userRole: req.role, username: req.username})
        } else {
          dados = dados.filter(recurso => recurso.visibilidade === 'publico')
          res.render('recursoPorTipo', {tipo, tipo, recursos: dados, data: d, titulo: 'Recursos do tipo "' + req.params.id + '" Disponíveis', userRole: req.role, username: req.username})
        }
      })
      .catch(erro => {
        res.render('error', {error: erro, message: 'Erro ao recuperar o tipo de recurso.'})
      })
    })
    .catch(erro => {
      res.render('error', {error: erro, message: 'Erro ao recuperar recursos'})
    })
  } else {
    Recurso.findById(req.params.id)
      .then(dados => {
        var idRecurso = req.params.id.replace("#", "%23")
        
        if (req.role == 'admin' || req.username == dados.autor || dados.visibilidade === 'publico') {
          res.render('recurso', {idRecurso: idRecurso, recurso: dados, data: d, titulo: dados.titulo + '(' + dados._id + ')', userRole: req.role, username: req.username})
        } else {
          res.render('error', {error: 'Não tem permissões para aceder a esta página.', message: 'Não tem permissões para aceder a este recurso.'})
        }
      })
      .catch(erro => {
        res.render('error', {error: erro, message: 'Erro ao recuperar o recurso.'})
      })
  }
});

// GET página de inserção de recursos
router.get('/registoRecurso', auth.verificaAcesso,function(req, res) {
  var d = new Date().toISOString().substring(0, 16)

  TipoRecurso.list()
  .then(dados => {
    res.render('registoRecurso', {data: d, titulo: 'Registo de Recurso', tipos: dados, userRole: req.role, username: req.username})
  })
  .catch(erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar tipos de recursos'})
  })
})

/* POST novo recurso */

router.post('/recursos', auth.verificaAcesso,upload.single('zip'), (req, res) => {
  var d = new Date().toISOString().substring(0, 16)

  // Verifica se o ficheiro é um zip
  if(req.file.mimetype !== 'application/zip') {
    res.render('error', {message: 'Erro ao recuperar os períodos.'})
  }

  // Verifica se o zip contem os ficheiros que o tipo de recurso exige
  TipoRecurso.findById(req.body.tipo)
  .then(tipo => {
    var zip = new AdmZip(req.file.path)
    var zipEntries = zip.getEntries()
    var found = true
    tipo.mandatoryFiles.forEach(function(file) {
      var foundFile = false
      zipEntries.forEach(function(zipEntry) {
        if(zipEntry.entryName === file) {
          foundFile = true
        }
      })
      if(!foundFile) {
        found = false
      }
    })

    // Determina o id do recurso (igual ao id mais alto + 1)
    var maxId = 0
    Recurso.list()
    .then(dados => {
      dados.forEach(function(recurso) {
        // Obtem o número do id removendo o #
        var id = recurso._id.replace("#", "")
        id = parseInt(id)

        if(id > maxId) {
          maxId = id
        }
      })
      var id = "#" + (maxId + 1)

      var recurso = {
        _id: id,
        tipo: req.body.tipo,
        dataCriacao: req.body.dataCriacao,
        dataRegisto: new Date(),
        visibilidade: req.body.visibilidade,
        tema: req.body.tema,
        titulo: req.body.titulo,
        subtitulo: req.body.subtitulo,
        autor: req.body.autor,
        comentarios: [],
        ranking: {
          estrelas: 0,
          numero_avaliacoes: 0
        },
        fileName: id + ".zip",
        notificacoes: []
      }

      if(!found) {
        res.render('error', {error: 'O zip não contem os ficheiros obrigatórios.', message: 'O zip não contem os ficheiros obrigatórios.'})
      } else {
        fs.mkdir(__dirname + '/../FileStore/Recursos/', { recursive: true }, (err) => {
          if (err) {
              console.error('Error creating folder:', err);
          } else {
            console.log('Folder created successfully: ' + recurso._id);

            let oldPath = __dirname + '/../' + req.file.path
            console.log("old: " + oldPath)
            let newPath = __dirname + '/../FileStore/Recursos/' + recurso.fileName
            console.log("new: " + newPath)

            Recurso.insert(recurso)
            .then(dados => {
              console.log('Recurso inserido com sucesso')
              
              fs.rename(oldPath, newPath, function (err) {
                if (err) throw err
                console.log('Successfully moved!')

                var idRecurso = dados._id.replace("#", "%23")
                
                res.redirect('/recursos/' + idRecurso);
              })
            })
            .catch(erro => {
              res.render('error', {error: erro, message: 'Erro ao inserir o recurso.'})
            })
          }
      })}
    })
    .catch(erro => {
      res.render('error', {error: erro, message: 'Erro ao recuperar recursos'})
    })
  })
  .catch(erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar tipos de recursos'})
  })
});

/* GET página de edição de recursos */

router.get('/recursos/edit/:id', auth.verificaAcesso,function(req, res) {
  var d = new Date().toISOString().substring(0, 16)

  Recurso.findById(req.params.id)
  .then(dados => {
    if (req.username == dados.autor || req.role == 'admin') {
      res.render('editRecurso', {recurso: dados, data: d, titulo: 'Edição de Recurso', userRole: req.role, username: req.username})
    } else {
      res.render('error', {error: 'Não tem permissões para aceder a esta página.', message: 'Não tem permissões para editar este recurso.'})
    }
  })
  .catch(erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar o recurso.'})
  })
});

/* PUT atualizar recurso */

router.post('/recursos/edit/:id', auth.verificaAcesso,upload.single('zip'), function(req, res) {
  var d = new Date().toISOString().substring(0, 16)

  // Varifica se é só para adicionar um comentário
  if(req.body.comentario && req.body.estrelas) {
    Recurso.findById(req.params.id)
    .then(recurso => {
      var comentario = {
        usuario: req.username,
        comentario: req.body.comentario,
        data: d,
        classificacao: req.body.estrelas
      }

      if (req.userRole == 'admin' || recurso.visibilidade === 'publico') {
        recurso.comentarios.push(comentario)
        console.log(recurso.ranking.estrelas)
        console.log(recurso.ranking.numero_avaliacoes)

        const estrelas = recurso.ranking.estrelas;
        const numeroAvaliacoes = recurso.ranking.numero_avaliacoes;
        const newEstrelas = req.body.estrelas;
        const result = math.evaluate(`(${estrelas} * ${numeroAvaliacoes} + ${newEstrelas}) / (${numeroAvaliacoes} + 1)`);

        recurso.ranking.estrelas = result;
        recurso.ranking.numero_avaliacoes += 1

        Recurso.updateById(req.params.id, recurso)
        .then(dados => {
          var idRecurso = req.params.id.replace("#", "%23")

          res.redirect('/recursos/' + idRecurso);
        })
        .catch(erro => {
          res.render('error', {error: erro, message: 'Erro ao atualizar o recurso.'})
        })
      } else {
        res.render('error', {error: 'Não tem permissões para aceder a esta página.', message: 'Não tem permissões para adicionar um comentário a este recurso.'})
      }
    })
    .catch(erro => {
      res.render('error', {error: erro, message: 'Erro ao recuperar o recurso.'})
    })
  } else {

    // Verifica se foi enviado um ficheiro
    if(req.file) {
  
      // Verifica se o ficheiro é um zip
      if(req.file.mimetype !== 'application/zip') {
        res.render('error', {message: 'Erro ao recuperar os períodos.'})
      }

      // Verifica se o zip contem os ficheiros que o tipo de recurso exige
      TipoRecurso.findById(req.body.tipo)
      .then(tipo => {
        var zip = new AdmZip(req.file.path)
        var zipEntries = zip.getEntries()
        var found = true
        tipo.mandatoryFiles.forEach(function(file) {
          var foundFile = false
          zipEntries.forEach(function(zipEntry) {
            if(zipEntry.entryName === file) {
              foundFile = true
            }
          })
          if(!foundFile) {
            found = false
          }
        })

        if(!found) {
          res.render('error', {error: 'O zip não contem os ficheiros obrigatórios.', message: 'O zip não contem os ficheiros obrigatórios.'})
        } else {
      
          fs.mkdir(__dirname + '/../FileStore/Recursos/', { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating folder:', err);
            } else {
              console.log('Folder created successfully: ' + req.params.id);

              Recurso.findById(req.params.id)
              .then(recurso => {
                if (req.username == recurso.autor || req.role == 'admin') {

                  if (req.body.tema) recurso.tema = req.body.tema
                  if (req.body.titulo) recurso.titulo = req.body.titulo
                  if (req.body.subtitulo) recurso.subtitulo = req.body.subtitulo
                  if (req.body.autor) recurso.autor = req.body.autor
                  if (req.body.visibilidade) recurso.visibilidade = req.body.visibilidade
                  if (req.body.dataCriacao) recurso.dataCriacao = req.body.dataCriacao
                  if (req.body.dataRegisto) recurso.dataRegisto = new Date()

                  fs.mkdir(__dirname + '/../FileStore/Recursos/', { recursive: true }, (err) => {
                    if (err) {
                        console.error('Error creating folder:', err);
                    } else {
                      console.log('Folder created successfully: ' + recurso._id);
                    
                      Recurso.updateById(req.params.id, recurso)
                      .then(dados => {
                        fs.unlink(__dirname + '/../FileStore/Recursos/' + req.body.fileName, (err) => {
                          if (err) {
                              console.error('Error deleting zip:', err);
                          }
          
                          let oldPath = __dirname + '/../' + req.file.path
                          console.log("old: " + oldPath)
                          let newPath = __dirname + '/../FileStore/Recursos/' + recurso.fileName
                          console.log("new: " + newPath)
          
                          fs.rename(oldPath, newPath, function (err) {
                            if (err) throw err
                            console.log('Successfully moved!')
                            var idRecurso = req.params.id.replace("#", "%23")
                            
                            // Informa o cliente que o recurso foi inserido com sucesso e envia o id do recurso
                            res.redirect('/recursos/' + idRecurso);
                          })
                        })
                      })
                      .catch(erro => {
                        res.render('error', {error: erro, message: 'Erro ao atualizar o recurso.'})
                      })
                    }
                  })
                } else {
                  res.render('error', {error: 'Não tem permissões para aceder a esta página.', message: 'Não tem permissões para editar este recurso.'})
                }
              })
              .catch(erro => {
                res.render('error', {error: erro, message: 'Erro ao recuperar o recurso.'})
              })
            }
          })
        }
      })
      .catch(erro => {
        res.render('error', {error: erro, message: 'Erro ao recuperar tipos de recursos'})
      })
    } else {
      Recurso.findById(req.params.id)
      .then(recurso => {
        if (req.username == recurso.autor || req.role == 'admin') {
          if (req.body.tema) recurso.tema = req.body.tema
          if (req.body.titulo) recurso.titulo = req.body.titulo
          if (req.body.subtitulo) recurso.subtitulo = req.body.subtitulo
          if (req.body.autor) recurso.autor = req.body.autor
          if (req.body.visibilidade) recurso.visibilidade = req.body.visibilidade
          if (req.body.dataCriacao) recurso.dataCriacao = req.body.dataCriacao
          if (req.body.dataRegisto) recurso.dataRegisto = new Date()

          Recurso.updateById(req.params.id, recurso)
          .then(dados => {
            var idRecurso = req.params.id.replace("#", "%23")

            res.redirect('/recursos/' + idRecurso);
          })
          .catch(erro => {
            res.render('error', {error: erro, message: 'Erro ao atualizar o recurso.'})
          })
        } else {
          res.render('error', {error: 'Não tem permissões para aceder a esta página.', message: 'Não tem permissões para editar este recurso.'})
        }
      })
      .catch(erro => {
        res.render('error', {error: erro, message: 'Erro ao recuperar o recurso.'})
      })
    }
  }
});

/* DELETE recurso */

router.get('/recursos/delete/:id', auth.verificaAcesso,function(req, res) {
  var d = new Date().toISOString().substring(0, 16)

  Recurso.findById(req.params.id)
  .then(recurso => {
    if (req.username == recurso.autor || req.role == 'admin') {
      Recurso.deleteById(req.params.id)
      .then(dados => {
        fs.unlink(__dirname + '/../FileStore/Recursos/' + dados.fileName, (err) => {
          if (err) {
              console.error('Error deleting zip:', err);
          } else {
            console.log('Zip deleted successfully: ' + dados.fileName);
          }
        })
        res.render('recursoApagado', {recurso: dados, data: d, titulo: 'Recurso apagado com sucesso'})
      })
      .catch(erro => {
        res.render('error', {error: erro, message: 'Erro ao apagar o recurso.'})
      })
    } else {
      res.render('error', {error: 'Não tem permissões para aceder a esta página.', message: 'Não tem permissões para apagar este recurso.'})
    }
  })
  .catch(erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar o recurso.'})
  })
});

module.exports = router;



/* Tipos de Recursos */


/* GET lista de tipos de recursos em formato JSON */
router.get('/tiposRecursos', auth.verificaAcesso,function(req, res) {
  TipoRecurso.list()
  .then(dados => res.jsonp(dados))
  .catch(erro => res.status(500).jsonp(erro))
});

/* GET tipo de recurso por nome */
router.get('/tiposRecursos/:id', function(req, res) {
  // Verifica se é para enviar apenas o json
  if(req.query.json) {
    TipoRecurso.findById(req.params.id)
    .then(dados => res.jsonp(dados))
    .catch(erro => res.status(500).jsonp(erro))
  } else {
    res.render('tipoRecurso', {tipo: req.params.id})
  }
});

/* GET página de inserção de tipos de recursos */

router.get('/registoTipoRecurso', auth.verificaAcesso,function(req, res) {
  var d = new Date().toISOString().substring(0, 16)

  if (req.role == 'admin') {
    res.render('registoTipoRecurso', {data: d, titulo: 'Registo de Tipo de Recurso'})
  } else {
    res.render('error', {error: 'Não tem permissões para aceder a esta página.', message: 'Não tem permissões para aceder a esta página.'})
  }
});

/* POST novo tipo de recurso */
router.post('/tiposRecursos', function(req, res) {

  if (req.role == 'admin') {

    let mandatoryFiles = req.body['mandatoryFiles[]'];

    if (!Array.isArray(mandatoryFiles)) {
      mandatoryFiles = [mandatoryFiles];
    }

    mandatoryFiles = mandatoryFiles.filter(fileName => fileName.trim() !== '');

    // Adiciona o manifest.xml ao array de ficheiros obrigatórios, caso ainda não exista
    if(!mandatoryFiles.includes('manifest.xml')) {
      mandatoryFiles.push('manifest.xml')
    }

    const tipoRecurso = {
      _id: req.body.nome,
      mandatoryFiles: mandatoryFiles
    }

    console.log(tipoRecurso)

    TipoRecurso.insert(tipoRecurso)
    .then(dados => {
      res.redirect('/recursos/' + req.body.nome)
    })
    .catch(erro => {
      res.render('error', {error: erro, message: 'Erro ao inserir o tipo de recurso.'})
    })
  } else {
    res.render('error', {error: 'Não tem permissões para aceder a esta página.', message: 'Não tem permissões para aceder a esta página.'})
  }
});

/* GET página de edição de tipos de recursos */
router.get('/tiposRecursos/edit/:id', auth.verificaAcesso,function(req, res) {
  var d = new Date().toISOString().substring(0, 16)

  if (req.role == 'admin') {
    TipoRecurso.findById(req.params.id)
    .then(dados => {
      res.render('editTipoRecurso', {tipo: dados, data: d, titulo: 'Edição do Tipo de Recurso "' + dados._id + '"'})
    })
    .catch(erro => {
      res.render('error', {error: erro, message: 'Erro ao recuperar o tipo de recurso.'})
    })
  } else {
    res.render('error', {error: 'Não tem permissões para aceder a esta página.', message: 'Não tem permissões para aceder a esta página.'})
  }
});

/* PUT atualizar tipo de recurso */
router.post('/tiposRecursos/edit/:id', auth.verificaAcesso,function(req, res) {

  if (req.role == 'admin') {

    let mandatoryFiles = req.body['mandatoryFiles[]'];

    if (!Array.isArray(mandatoryFiles)) {
      mandatoryFiles = [mandatoryFiles];
    }

    mandatoryFiles = mandatoryFiles.filter(fileName => fileName.trim() !== '');

    // Adiciona o manifest.xml ao array de ficheiros obrigatórios, caso ainda não exista
    if(!mandatoryFiles.includes('manifest.xml')) {
      mandatoryFiles.push('manifest.xml')
    }

    const tipoRecurso = {
      _id: req.params.id,
      mandatoryFiles: mandatoryFiles
    }

    TipoRecurso.updateById(req.params.id, tipoRecurso)
    .then(dados => {
      res.redirect('/recursos/' + req.params.id)
    })
    .catch(erro => {
      res.render('error', {error: erro, message: 'Erro ao atualizar o tipo de recurso.'})
    })
  } else {
    res.render('error', {error: 'Não tem permissões para aceder a esta página.', message: 'Não tem permissões para aceder a esta página.'})
  }
});

/* DELETE tipo de recurso */
router.get('/tiposRecursos/delete/:id', auth.verificaAcesso,function(req, res) {
  var d = new Date().toISOString().substring(0, 16)

  if (req.role == 'admin') {
    
    // Verifica se existem recursos associados ao tipo de recurso
    Recurso.listByFilters(req.params.id, null, null, '', '', '', '', null, null, 'dataRegisto', -1)
    .then(dados => {
      if(dados.length > 0) {
        res.render('error', {error: 'Não tem permissões para aceder a esta página.', message: 'Existem recursos associados a este tipo de recurso.'})
      } else {
        TipoRecurso.findById(req.params.id)
        .then(tipo => {
          TipoRecurso.deleteById(req.params.id)
          .then(dados => {
            console.log(tipo)
            res.render('tipoRecursoApagado', {tipo: tipo, data: d, titulo: 'Tipo de Recurso apagado com sucesso'})
          })
          .catch(erro => {
            res.render('error', {error: erro, message: 'Erro ao apagar o tipo de recurso.'})
          })
        })
        .catch(erro => {
          res.render('error', {error: erro, message: 'Erro ao recuperar o tipo de recurso.'})
        })
      }
    })
    .catch(erro => res.status(500).jsonp(erro))
  } else {
    res.render('error', {error: 'Não tem permissões para aceder a esta página.', message: 'Não tem permissões para aceder a esta página.'})
  }
});

/* GET da página HOME */
router.get('/home', auth.verificaAcesso,function(req, res) {
  var d = new Date().toISOString().substring(0, 16)

  TipoRecurso.list()
  .then(tipos => {
    Recurso.list()
    .then(dados => {
      // Filtra os recursos públicos adicionados na última hora
      var recursosRecentes = dados.filter(recurso => recurso.visibilidade === 'publico' && (new Date() - recurso.dataRegisto) <= 3600000)
      res.render('home', {data: d, titulo: 'Home', tipos: tipos, userRole: req.role, username: req.username, recursos: recursosRecentes})
    })
    .catch(erro => {
      res.render('error', {error: erro, message: 'Erro ao recuperar recursos'})
    })
  })
  .catch(erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar tipos de recursos'})
  })
});

/* GET da página de Login */
router.get('/login', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)

  res.render('login', {data: d, titulo: 'Gestor de Recursos'})
});

/* Download da base de todos num ficheiro zip com um ficheiro dados.json e uma pasta com todos os zips da diretoria FileStore/Recursos/ */

router.get('/downloadDataBase', auth.verificaAcesso,function(req, res) {
  var d = new Date().toISOString().substring(0, 16)

  if (req.role == 'admin') {

    var data = {
      recursos: [],
      tipos: [],
      users: []
    }

    Recurso.list()
    .then(recursos => {
      data.recursos = recursos

      TipoRecurso.list()
      .then(tipos => {
        data.tipos = tipos

        User.list()
        .then(users => {
          data.users = users

          console.log(data)

          var zip = new AdmZip()

          zip.addFile('dados.json', Buffer.from(JSON.stringify(data)))

          fs.readdir(__dirname + '/../FileStore/Recursos/', (err, files) => {
            if (err) {
              console.error('Error reading folder:', err);
            } else {
              files.forEach(file => {
                zip.addLocalFile(__dirname + '/../FileStore/Recursos/' + file)
              })

              fs.mkdir(__dirname + '/../FileStore/Downloads/', { recursive: true }, (err) => {
                if (err) {
                    console.error('Error creating folder:', err);
                } else {
                  console.log('Folder created successfully: ' + 'Downloads');

                  zip.writeZip(__dirname + '/../FileStore/Downloads/database.zip')

                  res.download(__dirname + '/../FileStore/Downloads/database.zip')
                }
              })
            }
          })
        })
        .catch(erro => {
          res.render('error', {error: erro, message: 'Erro ao recuperar utilizadores'})
        })
      })
      .catch(erro => {
        res.render('error', {error: erro, message: 'Erro ao recuperar tipos de recursos'})
      })
    })
    .catch(erro => {
      res.render('error', {error: erro, message: 'Erro ao recuperar recursos'})
    })
  }
});

/* POST da database */

router.post('/uploadDataBase', auth.verificaAcesso, upload.single('zip'), async function(req, res) {
  // Verifica se o ficheiro é um zip
  if (req.file.mimetype !== 'application/zip') {
    return res.render('error', { message: 'Erro ao recuperar os períodos.' });
  }

  // Verifica se contem um ficheiro dados.json e zips
  const zip = new AdmZip(req.file.path);
  const zipEntries = zip.getEntries();
  let foundJson = false;
  let foundZips = false;
  let wrongFiles = false;
  let data = null;

  for (const zipEntry of zipEntries) {
    if (zipEntry.entryName === 'dados.json') {
      foundJson = true;
      data = JSON.parse(zip.readAsText(zipEntry));
    } else if (zipEntry.entryName.endsWith('.zip')) {
      foundZips = true;
    } else {
      wrongFiles = true;
    }
  }

  if (wrongFiles) {
    return res.render('error', { error: 'O zip contem ficheiros inválidos.', message: 'O zip contem ficheiros inválidos.' });
  }

  if (!foundJson || !foundZips) {
    return res.render('error', { error: 'O zip não contem os ficheiros obrigatórios.', message: 'O zip não contem os ficheiros obrigatórios.' });
  }

  // Processa os recursos
  for (const recurso of data.recursos) {
    const dados = await Recurso.list();
    const maxId = Math.max(...dados.map(r => parseInt(r._id.replace('#', ''))), 0);
    const newId = "#" + (maxId + 1);

    recurso._id = newId;
    recurso.dataRegisto = new Date();

    // Guarda o path do zip correspondente ao recurso que vem dentro do zip
    const zipPath = recurso.fileName;
    recurso.fileName = newId + ".zip";

    try {
      await Recurso.insert(recurso);
      const outputPath = path.join(__dirname, '/../FileStore/Recursos/', recurso.fileName);

      fs.mkdirSync(path.dirname(outputPath), { recursive: true });

      // Extract the inner zip entry to the desired directory
      const innerZipEntry = zip.getEntry(zipPath);
      if (innerZipEntry) {
        const innerZipBuffer = zip.readFile(innerZipEntry); // Read the zip entry as a buffer
        fs.writeFileSync(outputPath, innerZipBuffer); // Write the buffer to the new file path
      } else {
        console.error('Inner zip entry not found:', zipPath);
      }
    } catch (erro) {
      return res.render('error', { error: erro, message: 'Erro ao inserir o recurso.' });
    }
  }

  // Processa os tipos de recursos
  for (const tipo of data.tipos) {
    try {
      if (await TipoRecurso.findById(tipo._id)) {
        console.log('Tipo de recurso já existente');
        continue;
      }
      await TipoRecurso.insert(tipo);
      console.log('Tipo de recurso inserido com sucesso');
    } catch (erro) {
      return res.render('error', { error: erro, message: 'Erro ao inserir o tipo de recurso.' });
    }
  }

  // Processa os utilizadores
  for (const user of data.users) {
    try {
      if (await User.findById(user._id)) {
        console.log('Utilizador já existente');
        continue;
      }
      await User.insert(user);
      console.log('Utilizador inserido com sucesso');
    } catch (erro) {
      return res.render('error', { error: erro, message: 'Erro ao inserir o utilizador.' });
    }
  }

  res.redirect('/home');
});

module.exports = router;
