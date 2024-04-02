var mongoose = require('mongoose');

var periodoSchema = new mongoose.Schema({
    _id : String,
    nome : String,
    compositores : [String]
}, {versionKey: false});

module.exports = mongoose.model('periodo', periodoSchema)
