const express = require('express')
const app = express()

const ejs = require('ejs')
const mongoose = require('mongoose')
const expressSession = require('express-session')
const flash = require('connect-flash')

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017', {
    useNewUrlParser: true
})

global.loggedIn = null
global.__basedir = __dirname
const router = require('./js/router')
//const admin = require('./js/admin')


app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded())
app.use(flash())
app.use(expressSession({
    secret: "node secret"
}))
app.use("*", (req, res, next) => {
    loggedIn = req.session.userId
    userID = null
    data = null
    next()
})
app.set('view engine', 'ejs')

app.use(router)
//app.use(admin)
// http://localhost:4000
app.listen(4000, () => {
    console.log("App listening on port 4000")
})