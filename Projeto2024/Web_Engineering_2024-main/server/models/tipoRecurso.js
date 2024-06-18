const mongoose = require('mongoose');

const tipoRecursoSchema = new mongoose.Schema({
    _id: String,    // Nome do tipo de recurso
    mandatoryFiles: [String]
}, { versionKey: false, collection: 'tiposRecursos' });

module.exports = mongoose.model('tiposRecursos', tipoRecursoSchema);
