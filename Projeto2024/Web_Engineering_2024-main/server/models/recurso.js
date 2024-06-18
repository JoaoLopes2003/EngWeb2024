const mongoose = require('mongoose');

const recursoSchema = new mongoose.Schema({
    _id: String,
    tipo: String,
    dataCriacao: Date,
    dataRegisto: Date,
    visibilidade: String,
    tema: String,
    titulo: String,
    subtitulo: String,
    autor: String,
    comentarios: [{
        usuario: String,
        comentario: String,
        data: Date,
        classificacao: Number
    }],
    ranking: {
        estrelas: Number,
        numero_avaliacoes: Number
    },
    fileName: String,
    notificacoes: [{
        usuario: String
    }]
}, { versionKey: false });

module.exports = mongoose.model('recursos', recursoSchema);
