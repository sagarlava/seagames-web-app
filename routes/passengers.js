const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Passenger = require('../models/passenger');
var session = require('express-session');


router.get('/', function (req, res, next) {
    Passenger.find(function (err, passengers) {
        if (err) return next(err);

        if (req.session.authenticated) {
            var passenger = req.session.passenger;
            res.render('passengers/index', {
                title: 'Express',
                passengers: passengers
            });
        } else {
            res.redirect("/users/signup");
        }
    });
});


module.exports = router;