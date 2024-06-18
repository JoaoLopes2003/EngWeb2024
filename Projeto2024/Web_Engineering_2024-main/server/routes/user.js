var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var passport = require('passport')
var userModel = require('../models/user')
var auth = require('../auth/auth')

var User = require('../controllers/user')
var Recurso = require('../controllers/recurso')

/* GET lista de utilizadores em formato JSON */

router.get('/', function(req, res) {
  User.list()
  .then(dados => res.jsonp(dados))
  .catch(erro => res.status(500).jsonp(erro))
});

/* POST novo utilizador */

router.post('/registar', function(req, res) {
  const user = {
    _id: req.body.username,
    nome: req.body.name,
    email: req.body.email,
    cargo: req.body.role,
    dataRegisto: new Date(),
    password: req.body.password
  }
  console.log(user)

  userModel.register(new userModel({ _id: user._id, nome: user.nome, cargo:user.cargo, email: user.email, dataRegisto: user.dataRegisto, password: user.password,
  }), 
    req.body.password, 
    function(err, user) {
      if (err) 
        res.jsonp({error: err, message: "Register error: " + err})
      else{
        passport.authenticate("local")(req,res,function(){
          jwt.sign({ username: req.body.username, role: req.body.role}, 
            "EngWeb2024",
            {expiresIn: 3600000},
            function(e, token) {
              if(e) {
                res.render('error', {error: e, message: 'Erro ao gerar o token.'})
              }
              else {
                res.cookie('token', token, { maxAge: 3600000, httpOnly: true }); // 1 hour expiration
                res.redirect('/home')
              }
            });
        })
      }     
  })
});

/* POST login */

router.post('/login', function(req, res) {

  const { username, password } = req.body;

  User.findById({ _id: username })
  .then(user => {
    if (!user) {
      return res.status(404).jsonp({ message: 'Utilizador não existe.' });
    }

    if (password == user.password) {
      jwt.sign({ username: user._id, role: user.cargo }, "EngWeb2024", { expiresIn: 3600000 }, (err, token) => {
        if (err) {
          return res.status(500).jsonp({ error: "Erro na geração do token: " + err });
        }
        res.cookie('token', token, { maxAge: 3600000, httpOnly: true }); // 1 hour expiration
        res.redirect('/home');
      });
    } else {
      res.status(401).jsonp({ message: 'Password incorreta.' });
    }
  })
  .catch(err => {
    res.status(500).jsonp({ error: err, message: 'Erro ao fazer login.' });
  });
});

/* Verifica se um username já existe */

router.get('/username/:id', function(req, res) {
  User.findById(req.params.id)
  .then(dados => {
    if(dados)
      res.status(200).jsonp({message: 'Username já existe.'})
    else
      res.status(404).jsonp({message: 'Username não existe.'})
  })
  .catch(erro => res.status(500).jsonp(erro))
});

/* Verifica se a password está correta */

router.post('/password/:id', function(req, res) {

  const password = req.body.password;

  User.findById(req.params.id)
  .then(user => {
    if (!user) {
      return res.status(404).jsonp({ message: 'Utilizador não existe.' });
    }

    if (password == user.password) {
      res.status(200).jsonp({ message: 'Password correta.' });
    } else {
      res.status(401).jsonp({ message: 'Password incorreta.' });
    }
  })
  .catch(err => {
    res.status(500).jsonp({ error: err, message: 'Erro ao verificar a password.' });
  });
});

/* Fazer logout */

router.get('/logout', auth.verificaAcesso, function(req, res) {
  res.clearCookie('token');
  res.redirect('/');
});

/* GET de um utilizador por id */

router.get('/:id', auth.verificaAcesso, function(req, res) {
  var d = new Date().toISOString().substring(0, 16)

  if (req.username == req.params.id) {
    User.findById(req.params.id)
    .then(user => {
      user.password = ''
      Recurso.listByFilters(null, null, null, '', '', '', req.params.id, null, null, 'dataRegisto', -1)
      .then(recursos => {
        res.render('user', {user: user, data: d, recursos: recursos, titulo: 'Utilizador "' + user._id + '"', username: req.username})
      })
      .catch(erro => {
        res.render('error', {error: erro, message: 'Erro ao recuperar os recursos do utilizador.'})
      })
    })
    .catch(erro => {
      res.render('error', {error: erro, message: 'Erro ao recuperar o utilizador.'})
    })
  } else {
    res.render('error', {message: 'Não tem permissão para aceder à página deste utilizador.'})
  }
});

/* GET página de edição de um utilizador */

router.get('/edit/:id', auth.verificaAcesso, function(req, res) {
  var d = new Date().toISOString().substring(0, 16)

  if (req.username == req.params.id) {
    User.findById(req.params.id)
    .then(user => {
      res.render('editUser', {user: user, data: d, titulo: 'Editar Utilizador "' + user._id + '"', username: req.username})
    })
    .catch(erro => {
      res.render('error', {error: erro, message: 'Erro ao recuperar o utilizador.'})
    })
  } else {
    res.render('error', {message: 'Não tem permissão para aceder à página deste utilizador.'})
  }
});

/* POST de alteração de um utilizador */

router.post('/edit/:id', auth.verificaAcesso, function(req, res) {

  if (req.body.passwordNova != req.body.passwordNovaConfirmacao) {
    res.render('error', {error: 'As passwords não coincidem.', message: 'As passwords não coincidem.'})
  } else {
    User.findById(req.body.username)
    .then(user => {
      var new_user = {
        _id: user._id,
        nome: req.body.nome,
        email: req.body.email,
        cargo: user.cargo,
        dataRegisto: user.dataRegisto,
        password: req.body.passwordNova ? req.body.passwordNova : user.password
      }
      
      console.log(new_user)

      User.updateById(req.username, new_user)
      .then(dados => {
        res.redirect('/users/' + req.params.id)
      })
      .catch(erro => {
        res.render('error', {error: erro, message: 'Erro ao editar o utilizador.'})
      })
    })
    .catch(erro => {
      res.render('error', {error: erro, message: 'Erro o utilizador não existe.'})
    })
  }
});

module.exports = router;
