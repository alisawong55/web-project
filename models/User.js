const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: [true, 'You already signup, please login']
    },
    password: {
        type: String,
        required: [true, 'Please provide password']
    },
    role:{type:String},
    collect:{type:[String]}
    
})

UserSchema.pre('save', function(next) {
    const user = this
    user.role = "user"
    bcrypt.hash(user.password, 10).then(hash => {
        user.password = hash
        next()
    }).catch(error => {
        console.error(error)
    })
})

const User = mongoose.model('User', UserSchema)
module.exports = User