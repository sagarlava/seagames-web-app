const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Bus = require('../models/bus');
var session = require('express-session');


router.get('/', function (req, res, next) {
    Bus.find(function (err, buses) {
        if (err) return next(err);

        if (req.session.authenticated) {
            var bus = req.session.bus;
            res.render('buses/index', {
                title: 'Express',
                buses: buses
            });
        } else {
            res.redirect("/users/signup");
        }
    });
});

// add form
router.get('/add', function (req, res, next) {
    if (req.session.authenticated) {
        var bus = req.session.bus;
        res.render('buses/add', {
            title: 'Express',
            bus: bus
        });
    } else {
        res.redirect("/users/signup");
    }
});

// Register
// instead app.get we use router.get because of the router variable up
//since that we are in users file it will auto add /users before this route
router.post('/add', (req, res, next) => {
    req.checkBody('bus_num', 'bus_num required').notEmpty();
    req.checkBody('model', 'model required').notEmpty();
    // req.checkBody('assigned_region', 'assigned_region required').notEmpty();
    req.checkBody('assigned_driver', 'assigned_driver required').notEmpty();
    //Create a new user

    req.getValidationResult().then(function (errors) {
        if (!errors.isEmpty()) {
            //console.log(errors.allErrors());
            res.render('buses/add', {
                title: 'Express',
                errors: errors.array(),
                request: req.body
            });
            return;
        }
        let newBus = new Bus({
            bus_num: req.body.bus_num,
            model: req.body.model,
            // assigned_region: req.body.assigned_region,
            assigned_driver: req.body.assigned_driver
        });
        var newBusRecord = new Bus(newBus);
        // Now we pass this User variable to the function
        newBusRecord.save(function (err, bus) {
            if (err) {
                res.json({
                    success: false,
                    msg: 'Failed to Create Bus'
                })
            } else {
                res.redirect("/buses/");
            }
        });
    });
});


router.get('/edit/:id', function (req, res) {
    Bus.findById(req.params.id, function (err, bus) {
        if (err) return next(err);
        res.render('buses/edit', {
            title: 'Express',
            bus: bus
        });
    });
});


router.post('/edit/:id', function (req, res, next) {
    Bus.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.redirect('/buses');
    });
});


/* GET /bus/id */
router.get('/:id', function (req, res, next) {
    Bus.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});



// delete
router.get('/delete/:id', function (req, res) {
    Bus.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.redirect('/buses');
    });
});
// end delete

module.exports = router;