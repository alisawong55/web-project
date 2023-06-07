const mongoose = require('mongoose')
const Schema = mongoose.Schema

const data = new Schema({
    title: {
        type: String,
        required: [true, 'Please provide title']},
    author: {type: String},
    translator: {type: String},
    detail:{type: String}
})
const Request = mongoose.model('Request', data)
module.exports = Request