const Novel = require('../models/Novel')
const Request = require('../models/Request')
const fs = require('fs');
const express = require('express')
const router = express.Router()


router.get('/admin/add',(req, res) => {
    res.render('addNovel')
  })
router.post('/admin/add/submit',(req, res) => {
    Novel.create(req.body).then(() => {
        console.log("add novel successfully!")
        res.redirect('/admin')
    }).catch((error) => {
        console.log(error.errors)
        if (error) {
            const validationErrors = Object.keys(error.errors).map(key => error.errors[key].message)
            req.flash('validationErrors', validationErrors)
            req.flash('data', req.body)
            return res.redirect('/admin/add')
        }
    })
})
router.get('/user/request',(req, res) => {
    res.render('requestNovel')
})
router.post('/user/request/submit',(req, res) => {
    Request.create(req.body).then(() => {
        console.log("request successfully!")
        res.redirect('/collection')
    }).catch((error) => {
        console.log(error.errors)
        if (error) {
            const validationErrors = Object.keys(error.errors).map(key => error.errors[key].message)
            req.flash('validationErrors', validationErrors)
            req.flash('data', req.body)
            return res.redirect('/user/request')
        }
    })
})
router.get('/admin/request',async(req, res) => {
    try{
        const requests = await Request.find()
        //res.json(novels)
        data = requests
        
    }catch(err){
        res.send('Error ' + err)
    }
    res.render('AdminViewRequest')
  })
router.get('/admin/request/delete/:id',(req,res) =>{
    try{
        Request.findByIdAndDelete(req.params.id)
        .then(() => res.json())
        .catch(err => res.status(500).json({ error: err }));
        console.log(req.params.id,"delete successfully!")
        res.redirect('/admin/request')
    }catch(err){
        res.send(err)
    }
})
router.get('/admin/edit/:id',async(req, res) => {
    try{
        const novels = await Novel.findById(req.params.id)
        //res.json(novels)
        data = novels
    }catch(err){
        res.send('Error ' + err)
    }
    res.render('editNovel')
  })
router.post('/admin/edit/:id',(req,res)=> {
    try{
        const { title, author, translator,image,category,detail } = req.body;
        Novel.findByIdAndUpdate(req.params.id, {
        title,author,translator,image,category,detail
    })
        //.then(novel => res.json(novel))
        .catch(err => res.status(500).json({ error: err }));
        console.log(req.params.id,"update successfully!")
        res.redirect('/admin')
    }catch(err){res.send(err)}
    
})
router.get('/admin/delete/:id',(req,res) => {
    try{
        Novel.findByIdAndDelete(req.params.id)
        .then(() => res.json())
        .catch(err => res.status(500).json({ error: err }));
        console.log(req.params.id,"delete successfully!")
        res.redirect('/admin')
    }catch(err){
        res.send(err)
    }
})
module.exports = router