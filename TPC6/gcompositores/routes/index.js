var express = require('express');
var router = express.Router();
var Compositor = require('../controllers/compositor')
var Periodo = require('../controllers/periodo')

/* GET home page. */
router.get('/', function(req, res, next) {
  var d = new Date().toISOString().substring(0, 16)
  res.render('index', { titulo: 'Gestão de Compositores de Música', data: d });
});

// GET /compositores
router.get('/compositores', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  Compositor.list()
  .then( compositores => {
      Periodo.list()
      .then( periodos => {
        res.render('listaCompositores', { compositores: compositores, periodos: periodos, data: d, titulo: 'Lista de Compositores' });
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
  Periodo.list()
  .then( periodos => {
    res.render('registoCompositor', { periodos: periodos, data: d, titulo: 'Registo de Compositor' });
  })
  .catch( erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar os períodos.'})
  })
});

// GET /compositores/edit/:id
router.get('/compositores/edit/:id', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  Periodo.list('http://localhost:3000/periodos')
  .then( periodos => {
    Compositor.findById(req.params.id)
    .then( compositor => {
      res.render('editCompositores', { compositor: compositor, periodos: periodos, data: d, titulo: "Editar Compositor" })
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
  Compositor.findById(req.params.id)
  .then( compositor => {
    Compositor.deleteById(req.params.id)
    .then( () => {
      Periodo.findById(compositor.periodo)
      .then( periodo => {
        periodo.compositores = periodo.compositores.filter(function(element) {
          return element !== req.params.id;
        });
        Periodo.updatePeriodoById(compositor.periodo, periodo)
        .then( periodo => {
          res.render('deleteCompositor', { compositor: compositor, data: d, titulo: "Compositor Apagado" })
        })
      })
      .catch( erro => {
        res.render('error', {error: erro, message: 'Erro ao recuperar o período.'})
      })
    })
    .catch ( erro => {
      res.render('error', {error: erro, message: 'Erro ao apagar o compositor.'})
    })
  })
  .catch ( erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar o compositor.'})
  })
});

// GET /compositores/:id
router.get('/compositores/:id', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  Compositor.findById(req.params.id)
  .then( compositor => {
    Periodo.findById(compositor.periodo)
    .then( periodo => {
      res.render('compositor', { data: d, compositor: compositor, periodo: periodo, titulo: "Compositor " +  compositor.id });
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
  Compositor.insert(req.body)
  .then( compositor => {
    Periodo.findById(compositor.periodo)
    .then( periodo => {
      periodo.compositores.push(compositor.id)
      Periodo.updatePeriodoById(compositor.periodo, periodo)
      .then( resposta => {
        res.render('compositor', { data: d, compositor: compositor, periodo: periodo, titulo: "Compositor " + compositor.id });
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
  Compositor.findById(req.params.id)
  .then( compositor_antes => {
    if (req.body.periodo != compositor_antes.periodo) {
      Compositor.updateCompositorById(req.params.id, req.body)
      .then ( compositor_depois => {
        Periodo.findById(compositor_antes.periodo)
        .then ( lista_periodo_antes => {
            lista_periodo_antes.compositores = lista_periodo_antes.compositores.filter(function(element) {
                return element !== req.params.id;
            });
            Periodo.updatePeriodoById(compositor_antes.periodo, lista_periodo_antes)
            .then( periodo_antigo => {
              Periodo.findById(req.body.periodo)
              .then ( lista_periodo_antes => {
                  lista_periodo_antes.compositores.push(compositor_depois.id)
                  Periodo.updatePeriodoById(compositor_depois.periodo, lista_periodo_antes)
                  .then( periodo_novo => {
                    res.render('compositor', { data: d, compositor: req.body, periodo: lista_periodo_antes, titulo: "Compositor " + req.body.id });
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
      Periodo.findById(req.body.periodo)
      .then ( periodo => {
        Compositor.updateCompositorById(req.params.id, req.body)
        .then ( compositor => {
          res.render('compositor', { data: d, compositor: req.body, periodo: periodo, titulo: "Compositor " + compositor.id });
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
  Periodo.list()
  .then( periodos => {
    res.render('listaPeriodos', { periodos: periodos, data: d, titulo: 'Lista de Períodos' });
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
  Periodo.findById(req.params.id)
  .then( periodo => {
    res.render('editPeriodos', { periodo: periodo, data: d, titulo: "Editar Período" })
  })
  .catch( erro => {
    res.render('error', {error: erro, message: 'Erro ao recuperar o período.'})
  })
});

// /periodos/delete/:id
router.get('/periodos/delete/:id', function(req, res) {
  var d = new Date().toISOString().substring(0, 16)
  Periodo.findById(req.params.id)
  .then( periodo => {
    if (periodo.compositores.length == 0) {
      Periodo.deleteById(req.params.id)
      .then( resposta => {
        res.render('deletePeriodo', { periodo: periodo, data: d, titulo: "Período Apagado" })
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
  Periodo.findById(req.params.id)
  .then( periodo => {
    Compositor.findByPeriodo(periodo.id)
    .then( compositores => {
      res.render('periodo', { data: d, periodo: periodo, compositores: compositores, titulo: "Período " + periodo.id });
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
  Periodo.list()
  .then( periodos => {
      var id = 0
      for(let i=0; i < periodos.length ; i++) {
        if (periodos[i].id > id) {
            id = periodos[i].id
        }
      }
      req.body._id = (parseInt(id) + 1) + "";
      req.body.compositores = [];
      Periodo.insert(req.body)
      .then( periodo => {
        res.render('periodo', { data: d, periodo: req.body, compositores: [], titulo: "Período " + req.body.id });
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
  Periodo.findById(req.params.id)
  .then( periodo_antes => {
    periodo_antes.nome = req.body.nome
    Compositor.findByPeriodo(req.params.id)
    .then( compositores => {
      Periodo.updatePeriodoById(req.params.id, periodo_antes)
      .then ( periodo => {
        res.render('periodo', { data: d, periodo: periodo_antes, compositores: compositores, titulo: "Período " + periodo_antes.id });
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
