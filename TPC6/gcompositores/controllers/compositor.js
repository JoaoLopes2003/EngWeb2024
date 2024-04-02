var Compositor = require('../models/compositor')

module.exports.list = () => {
    return Compositor
        .find()
        .sort({nome: 1})
        .exec()
}

module.exports.findById = id => {
    return Compositor
        .findOne({_id: id})
        .exec()
}

module.exports.findByPeriodo = periodo => {
    return Compositor
        .find({periodo: periodo})
        .sort({nome: 1})
        .exec()
}

module.exports.insert = compositor => {
        return Compositor.create(compositor)
}

module.exports.updateCompositorById = (id, compositor) => {
    return Compositor.updateOne({_id:id}, compositor)
}

module.exports.deleteById = id => {
    return Compositor.deleteOne({ _id: id });
};
