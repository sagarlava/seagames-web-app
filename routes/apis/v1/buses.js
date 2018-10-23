const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../../../config/database');
var Trip = require('../../../models/trip');
var Bus = require('../../../models/bus');
var Notification = require('../../../models/notification');

//Authenticate (Gives back a token)
// For Login
router.get('/', function (req, res) {
    var data = req.body;

    Bus.find({}, function (err, doc) {
        if (doc) {
            return res.json(doc);
        } else {
            return res.json({
                success: false,
                message: "Could not find buses",
                details: err
            });
        }
    });

});

module.exports = router;