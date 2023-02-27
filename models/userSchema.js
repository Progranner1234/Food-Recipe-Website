const mongoose = require('mongoose')

const userSchema  = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    fevorates:[Object],
    role:{type:String , default:"user"},
    resetPasswordLinks:[Object]
})

module.exports = mongoose.model('user',userSchema)