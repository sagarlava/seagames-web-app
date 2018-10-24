const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../../../config/database');
var Passenger = require('../../../models/passenger');

const User = require('../../../models/user');

//Authenticate (Gives back a token)
// For Login
router.post('/checkin', function (req, res) {

    var data = req.body;

    Passenger.findOne({
        passenger_id: data.passenger_id,
        trip_id: data.trip_id,
        depart_time: null
    }, function (err, passenger) {
        if (passenger) {
            return res.json({
                success: false,
                message: "Duplicate Checkin",
                passenger_info: passenger
            })
        } else {
            data.board_time = getDateTime();
            var obj = new Passenger(data);
            obj.save(function (err, obj) {
                if (err) return console.error(err);
                // res.status(200).json(obj);
                else {
                    return res.json({
                        success: true,
                        passenger_info: obj
                    });
                }
            });
        }

    });


    
});


router.put('/checkout/:id', function (req, res) {
    return Passenger.findOne({_id:req.params.id, trip_id:req.body.trip_id}, function (err, passenger) {
        passenger.depart_time = getDateTime();
        passenger.depart_location = req.body.depart_location;
        return passenger.save(function (err) {
            if (!err) {
                return res.json({
                    success: true,
                    passenger_info: passenger
                });
                // console.log("updated"+" "+req.body.Depart_time+" "+req.body.Depart_location);
            } else {
                console.log(err);
                return res.send(trip);
            }
        });
    });
});


router.get('/online-passengers/:trip_id', function (req, res) {
    if (req.params.trip_id) {
        Passenger.find({
            trip_id: req.params.trip_id,
            depart_time: null
        }, function (err, docs) {
            return res.json({
                success: true,
                passengers: docs
            });
        });
    }
});

router.get('/search/:id', function (req, res) {
    //console.log(req.id);
    Passenger.findOne({
        passenger_id: req.params.id
    }, function (err, passenger) {
        if (!err) {
            return res.json({
                success: true,
                passenger_info: passenger
            });
            // console.log("updated"+" "+req.body.Depart_time+" "+req.body.Depart_location);
        } else {
            return res.json({
                success: false,
                passenger_info: null
            });
        }

    }).sort({
        x: -1
    }).limit(1);
});


function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}

router.get('/online-passengers', function (req, res) {
    return Passenger.find(function (err, passengers) {
        if (!err) {
            return res.send(passengers);
        } else {
            return console.log(err);
        }
    });
});


module.exports = router;