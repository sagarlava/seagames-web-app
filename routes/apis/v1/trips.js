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
router.post('/start', function (req, res) {
    var data = req.body;
    data.start_time = getDateTime();

    var bus;
    var name = data.bus_num;
    //    console.log(name);
    Bus.findOne({
        bus_num: name
    }, function (err, doc) {
        if (doc) {
            bus = doc._id;
            data.bus_id = bus;

            var obj = new Trip(data);
            obj.save(function (err, obj) {
                if (err) return console.error(err);
                // res.status(200).json(obj);
                else {
                    return res.json({
                        success: true,
                        trip: obj
                    });
                }
            });

        }
    });

});

router.put('/end/:id', function (req, res) {
    return Trip.findById(req.params.id, function (err, trip) {
        trip.end_time = getDateTime();
        trip.end_location = req.body.end_location;
        trip.trip_completed = true;
        return trip.save(function (err) {
            if (!err) {
                return res.json({
                    success: true,
                    trip_info: trip
                });
                // console.log("updated"+" "+req.body.Depart_time+" "+req.body.Depart_location);
            } else {
                console.log(err);
                return res.send(trip);
            }
        });
    });
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


router.get('/', function (req, res) {
    var tripIdArray = [];
    Trip.find({}).populate("notifications")
        .exec(function (err, trips) {
//            trips.forEach(function (element) {
//                element = element._id.toString();
//                tripIdArray.push(element);
//            });
        res.send(trips);
        
        
        })
    return false;

    Notification.find({
        })
        .exec(function (err, brother) {
            //            res.send(tripIdArray);
            res.send(brother);
        })
});

module.exports = router;