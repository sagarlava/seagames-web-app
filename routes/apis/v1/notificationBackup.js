const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../../../config/database');
var Notification = require('../../../models/notification');
var Trip = require('../../../models/trip');
var Bus = require('../../../models/bus');
var Passenger = require('../../../models/passenger');

//Authenticate (Gives back a token)
// For Login
router.post('/issue', function (req, res) {
    var obj = new Notification(req.body);
    obj.save(function (err, obj) {
        if (err) return console.error(err);
        // res.status(200).json(obj);
        else {
            return res.json({
                success: true,
                notification_info: obj
            });
        }
    });
});



router.get('/:id', function (req, res) {


    var bus;
    var name = req.params.id;
    var data = [];
    //    console.log(name);
    Bus.findOne({
        bus_num: name
    }, function (err, doc) {
        if (doc) {
            var trips = [];
            var inTrip = [];
            //trips.push(doc)
            bus_id = doc._id;


            Trip.find({
                'bus_id': bus_id
            }).exec(function (err, data) {

                var i = 1;
                var total = data.length;
                //console.log("total="+total);

//                res.send(data);
                data.forEach(function (param) {
//
//                    Notification.find({
//                        trip_id: param._id
//                    }).exec(function (error, data2) {
//                        var rc = {
//                            trip: param,
//                            notification: data2
//                        }
////                        trips.push(rc);
//                        trips.push(rc);
//                        if (i == total) {
////                                                        res.send(trips);
//                        }
//                        i++;
//                    });
                    
                    Passenger.find({
                        trip_id: param._id
                    }).exec(function (error2, data3) {
                        var pc = {
                            trip: param,
                            passenger: data3
                        }
//                        trips.push(rc);
                        trips.push(pc);
                        if (i == total) {
                                                        res.send(trips);
                        }
                        i++;
                    });


                });
                //while(done==false){};



            });
        }
    });
});


module.exports = router;