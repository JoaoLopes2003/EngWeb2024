
const mongoose = require('mongoose')
var User = require("../models/user")



module.exports.list = () => {
    return User
        .find()
        .exec()
}



module.exports.findById = username => {
    return User
        .findOne({_id: username})
        .exec()
}

module.exports.insert = u => {
    var novo = new User(u)
    return novo.save()
}

module.exports.updateUserPassword = (id, pwd) => {
    return User.updateOne({_id:id}, pwd)
            .then(resposta => {
                return resposta
            })
            .catch(erro => {
                return erro
            })
}

module.exports.updateById = (username, u) => {
    return User
        .findOneAndUpdate({_id: username}, u, {new: true})
        .exec()
}

module.exports.deleteById = username => {
    return User
        .deleteOne({_id: username})
        .exec()
}