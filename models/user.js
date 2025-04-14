//models
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true // not a validation
    },
    // username: {
    //     type: String,
    //     required: true
    // }, 
    // password: {
    //     type: String,
    //     required: true
    // }
})

UserSchema.plugin(passportLocalMongoose); //auto creates username & pass

module.exports = mongoose.model('User', UserSchema);