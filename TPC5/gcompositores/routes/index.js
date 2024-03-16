var express = require('express');
var axios = require('axios')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var d = new Date().toISOString().substring(0, 16)
  res.render('index', { titulo: 'Gestão de Compositores de Música', data: d });
});

// GET /compositores
router.get('/compositores', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get('http://localhost:3000/compositores')
  .then( compositores => {
      axios.get('http://localhost:3000/periodos')
      .then( periodos => {
        res.render('listaCompositores', { compositores: compositores.data, periodos: periodos.data, data: d, titulo: 'Lista de Compositores' });
      })
      .catch( erro => {
        res.render('error', {error: erro, message: 'Erro ao recuperar os períodos.'})
      })
  })
  .catch( erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar os compositores.'})
  })
});

// GET /compositores/registo
router.get('/compositores/registo', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get('http://localhost:3000/periodos')
  .then( periodos => {
    res.render('registoCompositor', { periodos: periodos.data, data: d, titulo: 'Registo de Compositor' });
  })
  .catch( erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar os períodos.'})
  })
});

// GET /compositores/edit/:id
router.get('/compositores/edit/:id', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get('http://localhost:3000/periodos')
  .then( periodos => {
    axios.get('http://localhost:3000/compositores/' + req.params.id)
    .then( compositor => {
      res.render('editCompositores', { compositor: compositor.data, periodos: periodos.data, data: d, titulo: "Editar Compositor" })
    })
    .catch( erro => {
      res.render('error', {error: erro, message: 'Erro ao recuperar o compositor.'})
    })
  })
  .catch( erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar os períodos.'})
  })
});

// /compositores/delete/:id
router.get('/compositores/delete/:id', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.delete('http://localhost:3000/compositores/' + req.params.id)
  .then( compositor => {
    axios.get('http://localhost:3000/periodos/' + compositor.data.periodo)
    .then( periodo => {
      periodo.data.compositores = periodo.data.compositores.filter(function(element) {
        return element !== req.params.id;
      });
      axios.put("http://localhost:3000/periodos/" + compositor.data.periodo, periodo.data)
      .then( periodo => {
        res.render('deleteCompositor', { compositor: compositor.data, data: d, titulo: "Compositor Apagado" })
      })
    })
    .catch( erro => {
      res.render('error', {error: erro, message: 'Erro ao recuperar o período.'})
    })
  })
  .catch ( erro => {
    res.render('error', {error: erro, message: 'Erro ao apagar o compositor.'})
  })
});

// GET /compositores/:id
router.get('/compositores/:id', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get('http://localhost:3000/compositores/' + req.params.id)
  .then( compositor => {
    axios.get('http://localhost:3000/periodos/' + compositor.data.periodo)
    .then( periodo => {
      res.render('compositor', { data: d, compositor: compositor.data, periodo: periodo.data, titulo: "Compositor " +  compositor.data.id });
    })
    .catch( erro => {
      res.render('error', {error: erro, message: 'Erro ao recuperar o período do compositor.'})
    })
  })
  .catch( erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar o compositor.'})
  })
});

// POST /compositores/registo
router.post('/compositores/registo', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.post("http://localhost:3000/compositores", req.body)
  .then( compositor => {
    axios.get("http://localhost:3000/periodos/" + compositor.data.periodo)
    .then( periodo => {
      periodo.data.compositores.push(compositor.data.id)
      console.log(compositor.data)
      axios.put("http://localhost:3000/periodos/" + compositor.data.periodo, periodo.data)
      .then( resposta => {
        res.render('compositor', { data: d, compositor: compositor.data, periodo: periodo.data, titulo: "Compositor " + compositor.data.id });
      })
      .catch( erro => {
        res.render('error', {error: erro, message: 'Erro ao atualizar o período.'})
      })
    })
    .catch( erro => {
      res.render('error', {error: erro, message: 'Erro ao recuperar o período.'})
    })
  })
  .catch( erro => {
    res.render('error', {error: erro, message: 'Erro ao inserir o registo do novo compositor.'})
  })
});

// POST /compositores/edit/:id
router.post('/compositores/edit/:id', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get("http://localhost:3000/compositores/" + req.params.id)
  .then( compositor_antes => {
    if (req.body.periodo != compositor_antes.data.periodo) {
      axios.put("http://localhost:3000/compositores/" + req.params.id, req.body)
      .then ( compositor_depois => {
        axios.get("http://localhost:3000/periodos/" + compositor_antes.data.periodo)
        .then ( lista_periodo_antes => {
            lista_periodo_antes.data.compositores = lista_periodo_antes.data.compositores.filter(function(element) {
                return element !== req.params.id;
            });
            axios.put("http://localhost:3000/periodos/" + compositor_antes.data.periodo, lista_periodo_antes.data)
            .then( periodo_antigo => {
              axios.get("http://localhost:3000/periodos/" + compositor_depois.data.periodo)
              .then ( lista_periodo_antes => {
                  lista_periodo_antes.data.compositores.push(compositor_depois.data.id)
                  axios.put("http://localhost:3000/periodos/" + compositor_depois.data.periodo, lista_periodo_antes.data)
                  .then( periodo_novo => {
                    res.render('compositor', { data: d, compositor: compositor_depois.data, periodo: periodo_novo.data, titulo: "Compositor " + compositor_depois.data.id });
                  })
                  .catch( erro => {
                    res.render('error', {error: erro, message: 'Erro ao atualizar o período.'})
                  })
              })
              .catch( erro => {
                res.render('error', {error: erro, message: 'Erro ao recuperar o período.'})
              })
            })
            .catch( erro => {
              res.render('error', {error: erro, message: 'Erro ao atualizar o período.'})
            })
        })
        .catch( erro => {
          res.render('error', {error: erro, message: 'Erro ao recuperar o período.'})
        })
      })
      .catch( erro => {
        res.render('error', {error: erro, message: 'Erro ao atualizar o compositor.'})
      })
    } else {
      axios.get("http://localhost:3000/periodos/" + req.body.periodo)
      .then ( periodo => {
        axios.put("http://localhost:3000/compositores/" + req.params.id, req.body)
        .then ( compositor => {
          res.render('compositor', { data: d, compositor: compositor.data, periodo: periodo.data, titulo: "Compositor " + compositor.data.id });
        })
        .catch( erro => {
          res.render('error', {error: erro, message: 'Erro ao atualizar o compositor.'})
        })
      })
      .catch( erro => {
        res.render('error', {error: erro, message: 'Erro ao recuperar o período.'})
      })
    }
  })
  .catch( erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar o compositor.'})
  })
});

// GET /periodos
router.get('/periodos', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get('http://localhost:3000/periodos')
  .then( periodos => {
    res.render('listaPeriodos', { periodos: periodos.data, data: d, titulo: 'Lista de Períodos' });
  })
  .catch( erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar os períodos.'})
  })
});

// GET /periodos/registo
router.get('/periodos/registo', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  res.render('registoPeriodos', { data: d, titulo: 'Registo de Período' });
});

// GET /periodos/edit/:id
router.get('/periodos/edit/:id', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get('http://localhost:3000/periodos/' + req.params.id)
  .then( periodo => {
    res.render('editPeriodos', { periodo: periodo.data, data: d, titulo: "Editar Período" })
  })
  .catch( erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar o período.'})
  })
});

// /periodos/delete/:id
router.get('/periodos/delete/:id', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get('http://localhost:3000/periodos/' + req.params.id)
  .then( periodo => {
    if (periodo.data.compositores.length == 0) {
      axios.delete('http://localhost:3000/periodos/' + req.params.id)
      .then( resposta => {
        res.render('deletePeriodo', { periodo: periodo.data, data: d, titulo: "Período Apagado" })
      })
      .catch ( erro => {
        res.render('error', {error: erro, message: 'Erro ao apagar o período.'})
      })
    } else {
      res.render('deletePeriodoErro', { message: 'Não é possível apagar, pois há compositores associados ao período.', titulo: 'Apagar Período'})
    }
  })
  .catch ( erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar o período.'})
  })
});

// GET /periodos/:id
router.get('/periodos/:id', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get('http://localhost:3000/periodos/' + req.params.id)
  .then( periodo => {
    axios.get('http://localhost:3000/compositores?periodo=' + periodo.data.id)
    .then( compositores => {
      res.render('periodo', { data: d, periodo: periodo.data, compositores: compositores.data, titulo: "Período " + periodo.data.id });
    })
    .catch( erro => {
      res.render('error', {error: erro, message: 'Erro ao recuperar os compositores do período.'})
    })
  })
  .catch( erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar o período.'})
  })
});

// POST /periodos/registo
router.post('/periodos/registo', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get("http://localhost:3000/periodos")
  .then( periodos => {
      var id = 0
      for(let i=0; i < periodos.data.length ; i++) {
        if (periodos.data[i].id > id) {
            id = periodos.data[i].id
        }
      }
      req.body.id = (parseInt(id) + 1) + "";
      req.body.compositores = [];
      axios.post("http://localhost:3000/periodos", req.body)
      .then( periodo => {
        res.render('periodo', { data: d, periodo: periodo.data, compositores: [], titulo: "Período " + periodo.data.id });
      })
      .catch( erro => {
        res.render('error', {error: erro, message: 'Erro ao inserir o registo do novo período.'})
      })
  })
  .catch( erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar os períodos.'})
  })
});

// POST /periodos/edit/:id
router.post('/periodos/edit/:id', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get("http://localhost:3000/periodos/" + req.params.id)
  .then( periodo_antes => {
    periodo_antes.data.nome = req.body.nome
    axios.get('http://localhost:3000/compositores?periodo=' + req.params.id)
    .then( compositores => {
      axios.put("http://localhost:3000/periodos/" + req.params.id, periodo_antes.data)
      .then ( periodo => {
        res.render('periodo', { data: d, periodo: periodo.data, compositores: compositores.data, titulo: "Período " + periodo.data.id });
      })
      .catch( erro => {
        res.render('error', {error: erro, message: 'Erro ao atualizar o período.'})
      })
    })
    .catch( erro => {
      res.render('error', {error: erro, message: 'Erro ao recuperar os compositores.'})
    })
  })
  .catch( erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar o período.'})
  })
});

module.exports = router;
