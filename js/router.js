const User = require('../models/User')
const Novel = require('../models/Novel')
const Request = require('../models/Request')
const express = require('express')
const multer = require('multer');
const bcrypt = require('bcrypt')
const router = express.Router()

//Middle ware
const authMiddleware = require('../middleware/authMiddleware')
const redirectIfAuth = require('../middleware/redirectIfAuth')

//image upload

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/'); // Make sure the directory exists
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
const upload = multer({ storage: storage })

router.get('/profile',async(req, res) => {
    if(loggedIn){
        try{
        const novels = await User.findById(req.session.userId)
        const temp = novels.collect
        data = []
        if(temp.length){
            for(var i = 0; i< temp.length; i++){
                const a = await Novel.findById(temp[i])
                data.push(a)
            }
        }
        //res.send(data)
    }catch(err){
        res.send('Error ' + err)
    }
    res.render('profile')
    }else{res.send('Please login')}
    
  })
router.get('/admin',(req, res) => {
    try{
        Novel.find().then(data => {
            res.render('admin', { data });
        })
    }catch(err){
        res.send('Error ' + err)
    }
    //res.render('admin')
  })
router.get('/collection',async(req, res) => {
    try{
        const novels = await Novel.find()
        data = novels
    }catch(err){
        res.send('Error ' + err)
    }
    res.render('collection')
  })
router.get('/',(req, res) => {
    res.render('index')
  })
router.get('/index',authMiddleware,async (req, res) => {
    let UserData = await User.findById(req.session.userId)
    res.render('index', {
        UserData
    })
})
router.get('/login',redirectIfAuth,(req, res) => {
    let email = ""
    let password = ""
    let data = req.flash('data')[0]

    if (typeof data != "undefined") {
        email = data.email
        password = data.password
    }
    res.render('login', {
        errors: req.flash('validationErrors'),
        email: email,
        password: password
    })
  })
router.get('/register',redirectIfAuth,(req, res) => {
    let email = ""
    let password = ""
    let data = req.flash('data')[0]

    if (typeof data != "undefined") {
        email = data.email
        password = data.password
    }
    res.render('register', {
        errors: req.flash('validationErrors'),
        email: email,
        password: password
    })
  })
router.post('/user/login',redirectIfAuth,(req, res) => {
    const { email, password } = req.body 
    User.findOne({ email: email }).then((user) => {
        console.log(user)
        //compare password in db
        if (user) {
            let cmp = bcrypt.compare(password, user.password).then((match) => {
                if (match) {
                    req.session.userId = user._id.toString()
                    console.log(req.session.userId)
                    //user or admin
                    if(user.role =="admin"){
                       res.redirect('/admin')
                    }else{
                        res.redirect('/profile') 
                    }
                    
                } else {
                    req.flash('validationErrors', 'incorrect possword')
                    req.flash('data', req.body)
                    res.redirect('/login')
                }
            })
        } else {
            req.flash('validationErrors', "invalid email")
            req.flash('data', req.body)
            res.redirect('/login')
        }
    })
})
router.post('/user/register',redirectIfAuth,(req, res) => {
    User.create(req.body).then(() => {
        console.log("User registered successfully!")
        res.redirect('/')
    }).catch((error) => {
        // console.log(error.errors)
        if (error) {
            const validationErrors = Object.keys(error.errors).map(key => error.errors[key].message)
            req.flash('validationErrors', validationErrors)
            req.flash('data', req.body)
            return res.redirect('/register')
        }
    })
})
router.get('/logout',(req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})
router.get('/collection/search',async (req, res) => {
    const { query } = req.query;
    const searchQuery = new RegExp(query, 'i');
    console.log('search for ', req.query)
    const novels = await Novel.find({ title: searchQuery})
      //.then(novels => res.json(novels))
      .catch(err => res.status(500).json({ error: err }));
    data = novels
    res.render('collection')
  })
router.get('/admin/search',async (req, res) => {
    const { query } = req.query;
    const searchQuery = new RegExp(query, 'i');
    console.log('search for ', req.query)
    const novels = await Novel.find({ title: searchQuery})
      //.then(novels => res.json(novels))
      .catch(err => res.status(500).json({ error: err }));
    data = novels
    res.render('admin')
  })
//add to collection
router.get('/user/add/:id',(req, res) => {
    if(loggedIn){
    // Find the document you want to update and add an item to its array
    User.findByIdAndUpdate(req.session.userId, { $push: { collect: req.params.id } })
      .then(result => {
        console.log(`Successfully updated id ${req.session.userId } `);
      })
      .catch(error => {
        console.error(error);
      })
    res.redirect('/collection')
    }else{
        return res.status(400).send('Please login');
    }
})
//delete from collection
router.get('/user/delete/:id',(req, res) => {
    if (loggedIn) {
    User.findByIdAndUpdate(req.session.userId, { $pull: { collect: req.params.id } })
      .then(result => {
        console.log(`Successfully delete id ${req.session.userId }`);
      })
      .catch(error => {
        console.error(error);
      })
    res.redirect('/profile')
    }else{
        return res.status(404).send('Please login');
    }
})

//admin add novel
router.get('/admin/add',(req, res) => {
    res.render('addNovel')
  })
router.post('/admin/add/submit',upload.single('image'),(req, res) => {
    if(!req.file){
        res.send('please upload image')
    }
    const { title,author,translator,category,detail } = req.body;
    const image = req.file.filename
    const novel = new Novel({ title,author,translator,image,category,detail });
    novel.save().then(()=>{
        console.log("add novel successfully!")
        res.redirect('/admin')
    })

    /*Novel.create(req.body).then(() => {
        
        console.log("add novel successfully!")
        res.redirect('/admin')
    }).catch((error) => {
        console.log(error.errors)
        if (error) {
            return res.redirect('/admin/add')
        }
    })*/
})
//user request novel
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
            return res.redirect('/user/request')
        }
    })
})
//admin view user requests
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
//admin edit novel
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
router.post('/admin/edit/:id',upload.single('image'),(req,res)=> {
    try{
        if(req.file){//have image
            const image = req.file.filename
            const { title, author, translator,category,detail } = req.body;
            Novel.findByIdAndUpdate(req.params.id, {
            title,author,translator,image,category,detail})
        //.then(novel => res.json(novel))
        .catch(err => res.status(500).json({ error: err }));
        console.log(req.params.id,"update successfully!")
        res.redirect('/admin')
        }else{//no image
            const { title, author, translator,category,detail } = req.body;
            Novel.findByIdAndUpdate(req.params.id, {
            title,author,translator,category,detail})
            //.then(novel => res.json(novel))
            .catch(err => res.status(500).json({ error: err }));
            console.log(req.params.id,"update successfully!")
            res.redirect('/admin')
        }    
    }catch(err){res.send(err)}
    
})
//admin delete novel
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