const mongoose = require('mongoose')
var TipoRecurso = require("../models/tipoRecurso")

module.exports.list = () => {
    return TipoRecurso
        .find()
        .exec()
}

module.exports.findById = id => {
    return TipoRecurso
        .findOne({_id: id})
        .exec()
}

module.exports.insert = p => {
    var novo = new TipoRecurso(p)
    return novo.save()
}

module.exports.updateById = (id, p) => {
    return TipoRecurso
        .findOneAndUpdate({_id: id}, p, {new: true})
        .exec()
}

module.exports.deleteById = id => {
    return TipoRecurso
        .findOneAndDelete({_id: id})
        .exec()
}
