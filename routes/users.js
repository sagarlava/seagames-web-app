const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
var Promise = require('promise');
const User = require('../models/user');
var session = require('express-session');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var csv = require('ya-csv');
var multer = require('multer');
var upload = multer({
    dest: 'uploads/',
    fileFilter: function (req, file, cb) {
        cb(null, true);
    }
}).single('file'); // making single file


router.get('/', function (req, res, next) {
    User.find(function (err, users) {
        if (err) return next(err);

        if (req.session.authenticated) {
            var user = req.session.user;
            res.render('users/index', {
                title: 'Express',
                users: users
            });
        } else {
            res.redirect("/users/signup");
        }
    });
});

router.get('/signup', function (req, res, next) {
    User.find(function (err, users) {
        if (err) return next(err);
        //res.json(users);
        res.render('users/signup', {
            title: 'Express',
            users: users
        });
    });
});


// add form
router.get('/add', function (req, res, next) {
    if (req.session.authenticated) {
        var user = req.session.user;
        res.render('users/add', {
            title: 'Express',
            user: user
        });
    } else {
        res.redirect("/users/signup");
    }
});

// Register
// instead app.get we use router.get because of the router variable up
//since that we are in users file it will auto add /users before this route
router.post('/signup', (req, res, next) => {
    req.checkBody('username', 'username required').notEmpty();
    req.checkBody('password', 'Password required').notEmpty();
    //Create a new user

    req.getValidationResult().then(function (errors) {
        if (!errors.isEmpty()) {
            //console.log(errors.allErrors());
            res.render('users/add', {
                title: 'Express',
                errors: errors.array(),
                request: req.body
            });
            return;
        }
        let newUser = new User({
            name: req.body.name,
            username: req.body.username,
            password: req.body.password,
            type: "admin"
        });

        // Now we pass this User variable to the function
        User.addUser(newUser, (err, user) => {
            if (err) {
                res.json({
                    success: false,
                    msg: 'Failed to register user'
                })
            } else {
                res.redirect("/users/");
            }
        });
    });
});

// Register
// instead app.get we use router.get because of the router variable up
//since that we are in users file it will auto add /users before this route
router.post('/add', (req, res, next) => {
    req.checkBody('username', 'username required').notEmpty();
    req.checkBody('password', 'Password required').notEmpty();
    //Create a new user

    req.getValidationResult().then(function (errors) {
        if (!errors.isEmpty()) {
            //console.log(errors.allErrors());
            res.render('users/add', {
                title: 'Express',
                errors: errors.array(),
                request: req.body
            });
            return;
        }
        let newUser = new User({
            name: req.body.name,
            username: req.body.username,
            password: req.body.password,
            type: req.body.type,
            login_time: req.body.login_time,
            bus_no: req.body.bus_no,
            assigned_region: req.body.assigned_region
            
        });

        // Now we pass this User variable to the function
        User.addUser(newUser, (err, user) => {
            if (err) {
                res.json({
                    success: false,
                    msg: 'Failed to register user'
                })
            } else {
                res.redirect("/users/");
            }
        });
    });
});

//router.post('/upload', function(req, res) {
//    var form = new formidable.IncomingForm();
//    form.parse(req, function(err, fields, files) {
//        // `file` is the name of the <input> field of type `file`
//        var old_path = files.file.path,
//            file_size = files.file.size,
//            file_ext = files.file.name.split('.').pop(),
//            index = old_path.lastIndexOf('/') + 1,
//            file_name = old_path.substr(index),
//            new_path = path.join(process.env.PWD, '/uploads/', file_name + '.' + file_ext);
//
//        fs.readFile(old_path, function(err, data) {
//            fs.writeFile(new_path, data, function(err) {
//                fs.unlink(old_path, function(err) {
//                    if (err) {
//                        res.status(500);
//                        res.json({'success': false});
//                    } else {
//                        res.status(200);
//                        res.json({'success': true});
//                    }
//                });
//            });
//        });
//    });
//});


let getCSV = function (reader) {
    var dataArray = [];
    return new Promise(function (resolve, reject) {
        console.log("1111111111");
        reader.addListener('data', function (data) {
                dataArray.push(data);
                console.log("aswad", data)
                console.log("2222222222222");
                resolve(dataArray);
            })
            //        resolve(dataArray);
    })
};

var msg = {};
var msgArray = [];


let csvSave = function (dataArray) {
    return new Promise(function (resolve, reject) {
        console.log("ABDDUUULLLL");
        console.log(dataArray);
        dataArray.forEach(function (param) {
            console.log("WWWWWW", msgArray);
            console.log("aswad");
            var obj = new User(param);
            console.log(obj.name);
            obj.save(function (err, user) {
                if (err) {
                    msg['status'] = 'failed';
                    msg['user'] = obj.name;
                    msgArray.push(msg);
                    console.log("IIIIIIII", msgArray);
                } else {;
                    msg['status'] = 'success';
                    msg['user'] = obj.name;
                    msgArray.push(msg);
                    console.log("IIIIIIII", msgArray);
                }

                if (dataArray.length == msgArray.length) {
                    resolve(msgArray);
                }
            });

        });
    });
};



router.post('/upload', function (req, res) {
    upload(req, res, function (err) {
        var msg = "";
        var reader = csv.createCsvFileReader(req.file.path, {
            columnsFromHeader: true
        }); // allowing culomns headers to make object of ech row and columns 
        getCSV(reader).then(function (result) {
            return csvSave(result);
        }).then(function (result) {
            console.log("xxxxxxxxx", result);
            return res.send(result);
        })
    });
});

//router.post('/upload', function (req, res) {
//    upload(req, res, function (err) {
//        //        if (err) {
//        //            console.error(err.stack);
//        //            return res.end("Error uploading files.", err);
//        //        }
//
//        var msg = "";
//        var reader = csv.createCsvFileReader(req.file.path, {
//            columnsFromHeader: true
//        }); // allowing culomns headers to make object of ech row and columns 
//        reader.addListener('data', function (data) {
//            console.log(data);
//            var obj = new User(data);
//            try {
//                obj.save(function (err, obj) {
//                    if (err) {
//                        console.log("FAIIILL==>");
//                        msg = "already there";
//                    } else {
//                        console.log("success==>");
//                        //return res.json({
//                        //  success: true,
//                        //  trip: obj
//                        //});
//                        msg = "created";
//                    }
//                });
//                return res.send({
//                    message: msg
//                });
//            } catch (err) {
//                // This will not catch the throw!
//                console.error(err);
//            }
//
//        });
//    });
//});


router.post('/admin-authenticate', (req, res, next) => {
    // Get Username, Password thats been submitted
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({
                success: false,
                msg: 'User Not Found'
            });
        }
        // if the users exist compare password between the users intering and the actual hashed password from users table
        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                req.session.authenticated = true;
                req.session.user = user;

                return res.json({
                    success: true,
                    msg: 'Great Memory'
                });

            } else { //if it dosen't match
                return res.json({
                    success: false,
                    msg: 'Wrong Password'
                });
            }
        });
    });
});



// delete


let updateUserRecord = function (updatedPassword, req) {
    return new Promise(function (resolve, reject) {
        var error = 'false';
        req.body.password = updatedPassword;
        User.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
            if (err) {
                error = err;
            }
            resolve(error);
        });

    });
};

router.get('/edit-password/:id', function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (err) return next(err);
        res.render('users/edit-password', {
            title: 'Express',
            user: user
        });
    });
});

router.get('/edit/:id', function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (err) return next(err);
        res.render('users/edit', {
            title: 'Express',
            user: user
        });
    });
});

router.post('/edit-password/:id', function (req, res, next) {
    User.firstStep().then(function (salt) {
        return User.secondStep(salt, req.body.password);
    }).then(function (password) {
        return updateUserRecord(password, req);
    }).then(function (status) {
        if (status == 'false') {
            res.redirect('/users');
        }
    })
});

router.post('/edit/:id', function (req, res, next) {
    User.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.redirect('/users');
    });
});


/* GET /users/id */
router.get('/:id', function (req, res, next) {
    User.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});



// delete
router.get('/delete/:id', function (req, res) {
    User.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.redirect('/users');
    });
});
// end delete

module.exports = router;