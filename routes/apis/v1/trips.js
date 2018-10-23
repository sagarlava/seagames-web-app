const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../../../config/database');
var Trip = require('../../../models/trip');
var Bus = require('../../../models/bus');
var Passenger = require('../../../models/passenger');
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

router.put('/transferold/:id', function (req, res) {
    return Trip.findById(req.params.id, function (errr, trip) {
        var b_num = req.body.bus_num;
        if(!errr) {
            Bus.findOne({
                bus_num: b_num
            }, function (err, doc) {
                if (doc) {
                    var bus_id = doc._id;
                    trip.bus_id = bus_id;
                    return trip.save(function (err) {
                        if (!err) {
                            return res.json({
                                success: true,
                                trip_info: trip
                            });
                            // console.log("updated"+" "+req.body.Depart_time+" "+req.body.Depart_location);
                        } else {
                            return res.json({
                                success: false,
                                message: "Could not update trip",
                                details: err
                            });
                        }
                    });
                } else {
                    return res.json({
                        success: false,
                        message: "Bus not found"
                    });
                }
            });
        } else {
            return res.json({
                success: false,
                message: "Trip not found"
            });
        }
       
    });
});


router.put('/transfer/:id', function (req, res) {
    var b_num = req.body.bus_num;
    return Bus.findOne({
        bus_num: b_num
    }, function (err, doc) {
        if (doc) {
            var bus_id = doc._id;

            return Trip.findOne({bus_id:bus_id, trip_completed: false}, function (errr, trip) {
                if(trip) {
                    var tripId = trip._id;
                    Passenger.update({trip_id:req.params.id}, {trip_id: tripId}, {multi: true}, 
                        function(err, num) {
                            if(!err) {
                                return Trip.findOne({_id:req.params.id}, function (errrr, trp) {
                                    if(trp) {
                                        trp.bus_id = bus_id;
                                        return trp.save(function (errrrr) {
                                            if (!errrrr) {
                                                return res.json({
                                                    success: true,
                                                    trip_info: trp
                                                });
                                                // console.log("updated"+" "+req.body.Depart_time+" "+req.body.Depart_location);
                                            } else {
                                                return res.json({
                                                    success: false,
                                                    message: "Could not update bus info in current trip",
                                                    details: err
                                                });
                                            }
                                        });
                                    } else {

                                    }
                                });
                            } else {
                                return res.json({
                                    success: false,
                                    message: "Could not transfer passenger",
                                    details: err
                                });
                            }
                        }
                    );
        
                } else {
                    return res.json({
                        success: false,
                        message: "Running Trip not found for given bus number"
                    });
                }
               
            });
            
        } else {
            return res.json({
                success: false,
                message: "Bus not found"
            });
        }
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