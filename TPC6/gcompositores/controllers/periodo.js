var Periodo = require('../models/periodo')

module.exports.list = () => {
    return Periodo
        .find()
        .sort({nome: 1})
        .exec()
}

module.exports.findById = id => {
    return Periodo
        .findOne({_id: id})
        .exec()
}

module.exports.insert = periodo => {
        return Periodo.create(periodo)
}

module.exports.updatePeriodoById = (id, periodo) => {
    return Periodo.updateOne({_id:id}, periodo)
}

module.exports.deleteById = id => {
    return Periodo.deleteOne({ _id: id });
};
