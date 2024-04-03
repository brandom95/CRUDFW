const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
const user = require('../models/user');
const fs = require("fs");

// image upload 
var storage = multer.diskStorage({
    destination: function(req, file,cb){
        cb(null,'./uploads');
    },
    filename: function(req,file,cb){
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    },
});

var upload = multer ({
    storage: storage,
}).single("image");

//insert an user into database 
router.post("/add", upload, (req,res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        event: req.body.event,
        image: req.file.filename,
    })
    user.save()
    .then(() => {
        req.session.message = {
            type: 'success',
            message: 'user added successfully'
        };
        res.redirect('/');
    })
    .catch(err => {
        res.json({ message: err.message, type: 'danger' });
    });

})

router.get('/', (req, res)=> {
    User.find().exec()
        .then(users => {
            res.render("index", {
                title: "home page",
                users: users,
            });
        })
        .catch(err => {
            res.json({message: err.message});
        });
});


router.get ("/add", (req, res) => {
    res.render("add_users", {title:"Add Users"});
});


//edit an user reouter
router.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    User.findById(id).exec()
        .then(user => {
            if (user == null) {
                res.redirect('/');
            } else {
                res.render('edit_users', {
                    title: "Edit User",
                    user: user,
                });
            }
        })
        .catch(err => {
            console.error(err);
            res.redirect('/');
        });
});

//update user route

router.post('/update/:id', upload, (req,res)=> {
    let id=req.params.id;
    let new_image='';
    if(req.file){
        new_image = req.file.filename;
        try{
            fs.unlinkSync('./upload/'+req.body.old_image);
        } catch(err){
            console.log(err);
        }
    } else{
        new_image = req.body.old_image;
    }

    user.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image,
    }, { new: true }).exec()
        .then(result => {
            req.session.message = {
                type: 'success',
                message: 'User updated successfully!',
            };
            res.redirect('/');
        })
        .catch(err => {
            res.json({ message: err.message, type: 'danger' });
        });
    
});

//delete user route

router.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    user.findByIdAndDelete(id).exec()
        .then(result => {
            if (result && result.image != '') {
                try {
                    fs.unlinkSync('./uploads/' + result.image);
                } catch (err) {
                    console.error(err);
                }
            }
            req.session.message = {
                type: 'info',
                message: "User deleted!",
            };
            res.redirect("/");
        })
        .catch(err => {
            console.error(err);
            res.json({ message: err.message });
        });
});


module.exports = router;
