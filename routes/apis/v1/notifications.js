const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../../../config/database');
var json2csv = require('json2csv');
var Notification = require('../../../models/notification');
var Trip = require('../../../models/trip');
var Bus = require('../../../models/bus');
var Passenger = require('../../../models/passenger');
var jsonexport = require('jsonexport');
var Promise = require('promise');

//Authenticate (Gives back a token)
// For Login
router.post('/issue', function (req, res) {
    var obj = new Notification(req.body);
    obj.date_time = getDateTime();
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

router.get('/live-notifications/:date', function (req, res) {
    var date = req.params.date;
    var startDate = date + ":00:00:00:00";
    var endDate = date + ":23:59:59:59";
    if (date) {
        Notification.find({
                date_time: {
                    $gte: startDate,
                    $lte: endDate
                }
            })
            .populate({
                path: 'trip_id',
                populate: {
                    path: 'bus_id'
                }
            })
        .exec(function (err, notifications) {
            if (err) return console.error(err);

            res.json({
                success: true,
                notification: notifications
            });
        });
    }
});

var tripIdResult;
var TripsJson;
var PassengersJson;
var NotificationsJson;
var tripStartDate;
var tripEndDate;


let getBus = function (bus_value, type) {
    return new Promise(function (resolve, reject) {
        var bus;
        if (type == "bus_num") {
            console.log("IIIIIIIIIIIII----");
            bus = Bus.findOne({
                bus_num: bus_value
            }).exec();
        } else if (type == "driver_name") {
            console.log("OOOOOOOOOOOO----")
            bus = Bus.findOne({
                assigned_driver: bus_value
            }).exec();

        }
        resolve(bus);
    });
};


let getTrip = function (busObject) {
    console.log("getTrip----", tripStartDate, tripEndDate);
    return new Promise(function (resolve, reject) {
        var trip = Trip.find({
            'bus_id': busObject.id,
            start_time: {
                $gte: tripStartDate,
                $lte: tripEndDate
            }
        }).exec()
        resolve(trip);
    });
};

let getTripID = function (tripObject) {
    TripsJson = tripObject;
    console.log("getTripID----", tripObject);
    return new Promise(function (resolve, reject) {
        var tripId = [];
        tripObject.forEach(function (param) {
            tripId.push(param._id)
        });
        resolve(tripId);
    });
};

let getPassenger = function (tripId) {
    console.log("getPassenger----", tripId);
    return new Promise(function (resolve, reject) {
        var passenger = Passenger.find().where('trip_id').in(tripId).exec();

        resolve(passenger);
    });
};

let getNotification = function (tripId) {

    return new Promise(function (resolve, reject) {
        console.log("TRIIPP----", tripIdResult);
        var notification = Notification.find().where('trip_id').in(tripIdResult).exec();
        resolve(notification);
    });
};

let getNotificationList = function (notification) {
    NotificationsJson = notification;
    console.log("getNotificationList----", notification);
    return new Promise(function (resolve, reject) {
        var notificationGroupTrip = [];
        notification.forEach(function (param) {
            if (notificationGroupTrip[param.trip_id] == null) {
                notificationGroupTrip[param.trip_id] = [];
            }
            notificationGroupTrip[param.trip_id].push(param);
        })
        resolve(notificationGroupTrip);
    });
};

router.get('/online', function (req, res) {
    var fields = ['car', 'price', 'color'];
    var myCars = [
        {
            "car": "Audi",
            "price": 40000,
            "color": "blue"
  }, {
            "car": "BMW",
            "price": 35000,
            "color": "black"
  }, {
            "car": "Porsche",
            "price": 60000,
            "color": "green"
  }
];
    var csv = json2csv({
        data: myCars,
        fields: fields
    });
    return Passenger.find(function (err, passengers) {
        if (!err) {
            res.set({
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=file.csv',
                'Pragma': 'no-cache'
            })
            return res.send(csv);
        } else {
            return console.log(err);
        }
    });
});

router.get('/online2', function (req, res) {
    var contacts = [{
        name: 'Bob',
        lastname: 'Smith',
        family: {
            name: 'Peter',
            type: 'Father'
        }
}, {
        name: 'James',
        lastname: 'David',
        family: {
            name: 'Julie',
            type: 'Mother'
        }
}, {
        name: 'Robert',
        lastname: 'Miller',
        family: null,
        location: [1231, 3214, 4214]
}, {
        name: 'David',
        lastname: 'Martin',
        nickname: 'dmartin'
}];

    jsonexport(contacts, function (err, csv) {
        if (err) return console.log(err);
        res.send(csv);
    });
});


let getTripCsv = function (trips) {
    return new Promise(function (resolve, reject) {
        var tripsCsv = [];
        trips.forEach(function (param) {
            if (trips[param.trip_id] == null) {
                trips[param.trip_id] = [];
            }
            trips[param.trip_id].push(param.Passengers);
            trips[param.trip_id].push(param.Notifications);
        })
        resolve(trips);
    });
};

router.get('/report/:start_date/:end_date/:type/:id', function (req, res) {

    res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=file.csv',
        'Pragma': 'no-cache'
    })

    var bus_value = req.params.id;
    tripStartDate = req.params.start_date + ":00:00:00:00";
    tripEndDate = req.params.end_date + ":23:59:59:59";
    var type = req.params.type;


    getBus(bus_value, type).then(function (result) {
            return getTrip(result);
        }).then(function (result) {
            return getTripID(result);
        }).then(function (result) {
            tripIdResult = result;
            return getPassenger(result);
        })
        .then(function (result) {
            PassengersJson = result;
            console.log("PASSENGER--Json", PassengersJson);
            return getNotification(result);
        }).then(function (result) {
            NotificationsJson = result;
            console.log("NotificationsJson--Json", NotificationsJson);

            var passengerGroupByTrip = [];
            PassengersJson.forEach(function (element) {
                if (passengerGroupByTrip[element.trip_id] == null) {
                    passengerGroupByTrip[element.trip_id] = [];
                }
                passengerGroupByTrip[element.trip_id].push(element);
            });
            var notificationGroupByTrip = []
            NotificationsJson.forEach(function (element) {
                if (notificationGroupByTrip[element.trip_id] == null) {
                    notificationGroupByTrip[element.trip_id] = [];
                }
                notificationGroupByTrip[element.trip_id].push(element);
            });

            var trips = [];
            var trip_fields = ['_id', 'start_location', 'start_time', 'bus_id', 'end_location', 'end_time'];
            var passengers_fields = ['board_location', 'passenger_id', 'name', 'nric', 'contingent', 'sport', 'tag', 'post', 'access', 'board_time', 'depart_location', 'depart_time'];
            var notifications_fields = ['issue', 'description', 'date_time'];
            var br_fields = ['', ''];
            var csv = '';
            TripsJson.forEach(function (element) {
                var tmpTrip = {};
                var end_time = element.end_time;
                var end_location = element.end_location;

                if (end_location == null) end_location = "Trip Not Completed";
                if (end_time == null) end_time = "Trip Not Completed";

                tmpTrip._id = element._id;
                tmpTrip.start_location = element.start_location;
                tmpTrip.start_time = element.start_time;
                tmpTrip.bus_id = element.bus_id;
                tmpTrip.end_location = element.end_location;
                tmpTrip.end_time = element.end_time;
                trips.push(tmpTrip);
                tmpTrip["Passengers"] = passengerGroupByTrip[element._id];
                tmpTrip["Notifications"] = notificationGroupByTrip[element._id];
                var tripCSV = [
                    {
                        "_id": element._id,
                        "start_location": element.start_location,
                        "start_time": element.start_time,
                        "bus_id": element.bus_id,
                        "end_location": end_location,
                        "end_time": end_time
                        }
                ];

                var trip_csv = json2csv({
                    data: tripCSV,
                    fields: trip_fields
                });


                var passengers_csv = '';
                try {

                    var PassengersCSVArray = [];
                    passengerGroupByTrip[element._id].forEach(function (element) {
                        var Passenger = {};
                        var depart_location = element.depart_location;
                        var depart_time = element.depart_time;
                        if (depart_location == null) depart_location = "No Checkout Record";
                        if (depart_time == null) depart_time = "No Checkout Record";

                        Passenger.board_location = element.board_location;
                        Passenger.passenger_id = element.passenger_id;
                        Passenger.name = element.name;
                        Passenger.nric = element.nric;
                        Passenger.contingent = element.contingent;
                        Passenger.sport = element.sport;
                        Passenger.tag = element.tagID;
                        Passenger.post = element.post;
                        Passenger.access = element.access;
                        Passenger.board_time = element.board_time;
                        Passenger.depart_location = depart_location;
                        Passenger.depart_time = depart_time;
                        PassengersCSVArray.push(Passenger);
                    });

                    passengers_csv = json2csv({
                        data: PassengersCSVArray,
                        fields: passengers_fields
                    });
                } catch (err) {
                    passengers_csv = '';
                }




                /******************** Notifications *************************/
                var notifications_csv = '';
                try {
                    var NotificationsCSVArray = [];
                    notificationGroupByTrip[element._id].forEach(function (element) {
                        var Notification = {};
                        Notification.issue = element.issue;
                        Notification.description = element.description;
                        Notification.date_time = element.date_time;
                        NotificationsCSVArray.push(Notification);
                    });

                    notifications_csv = json2csv({
                        data: NotificationsCSVArray,
                        fields: notifications_fields
                    });

                } catch (err) {
                    notifications_csv = '';
                }
                if (csv != "") csv += "\r\n\r\n";
                csv += 'Trips\r\n' + trip_csv + '\r\n\r\n' + 'Passengers\r\n' + passengers_csv + 'Notifications\r\n' + notifications_csv;

            });

            if (trips != "") {
                res.send(csv);
            } else {
                res.send("Report is Empty");
            }

        })
});

module.exports = router;