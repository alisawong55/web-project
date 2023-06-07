const mongoose = require('mongoose')
const Schema = mongoose.Schema

const data = new Schema({
    title: {
        type: String,
        required: [true, 'Please provide title']},
    author: {type: String},
    translator: {type: String},
    image: {type: String},
    category: {type: String},
    detail:{type: String},
})
const Novel = mongoose.model('Novel', data)
module.exports = Novel