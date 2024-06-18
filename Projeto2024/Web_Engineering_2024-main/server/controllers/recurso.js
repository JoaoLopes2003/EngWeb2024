const mongoose = require('mongoose')
var Recurso = require("../models/recurso")

module.exports.list = () => {
    return Recurso
        .find()
        .sort({dataRegisto: -1})
        .exec()
}

// Procura recursos por tipo, data de criação, data de registo, tema, título, subtitulo, autor e ranking, sendo que estes campos são opcionais
module.exports.listByFilters = (tipo, dataCriacao, dataRegisto, tema, titulo, subtitulo, autor, rankingMin, rankingMax, sortAttribute, order) => {
    var query = {}

    if(tipo) query.tipo = tipo

    if (dataCriacao) {
        const startDate = new Date(dataCriacao);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
        query.dataCriacao = { $gte: startDate, $lt: endDate };
    }

    if(dataRegisto) {
        const startDate = new Date(dataRegisto);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
        query.dataRegisto = { $gte: startDate, $lt: endDate };
    }
    
    if(tema) query.tema = tema
    if(titulo) query.titulo = titulo
    if(subtitulo) query.subtitulo = subtitulo
    if(autor) query.autor = autor
    if(rankingMin || rankingMax) {
        query["ranking.estrelas"] = {}
        if(rankingMin) query["ranking.estrelas"].$gte = rankingMin
        if(rankingMax) query["ranking.estrelas"].$lte = rankingMax
    }

    if (sortAttribute === 'ranking') {
        sortAttribute = 'ranking.estrelas'
    } else if (sortAttribute === 'id') {
        sortAttribute = '_id'
    }

    console.log(query)

    return Recurso
        .find(query)
        .sort({[sortAttribute]: order})
        .exec()
}

module.exports.findById = id => {
    return Recurso
        .findOne({_id: id})
        .exec()
}

module.exports.insert = p => {
    var novo = new Recurso(p)
    return novo.save()
}

module.exports.updateById = (id, p) => {
    return Recurso
        .findOneAndUpdate({_id: id}, p, {new: true})
        .exec()
}

module.exports.deleteById = id => {
    return Recurso
        .findOneAndDelete({_id: id})
        .exec()
}
