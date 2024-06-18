const mongoose = require('mongoose');

var passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new mongoose.Schema({
    _id: String, // Username
    nome: String,
    email: String,
    cargo: String,
    dataRegisto: Date,
    password: String
}, { versionKey: false });

userSchema.plugin(passportLocalMongoose , { usernameField: '_id' });

module.exports = mongoose.model('users', userSchema);
