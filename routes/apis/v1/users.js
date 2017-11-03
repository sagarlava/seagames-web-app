const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../../../config/database');
const User = require('../../../models/user');
const Bus = require('../../../models/bus');
var Trip = require('../../../models/trip');
var session = require('express-session');
var Promise = require('promise');
var rp = require('request-promise');
var ObjectId = require('mongoose').Types.ObjectId;

router.get('/', function (req, res, next) {
    res.send('test');
});



 router.post('/send-message', function (req, res) {
     var message = req.body.message;
     var driverId = req.body.driverId;
     User.findOne({
        _id: new ObjectId(driverId)
     }, function (err, doc) {
         var deviceId;
             if (doc) {
                 // res.send(doc);
                 // deviceId = doc.fcm_token;
                 //res.send(message);
                 // res.send(doc.fcm_token);
                
                 var result = sendMessageToUser(doc.fcm_token, message,res);
                
                 // sendMessageToUser(doc.fcm_token, message);
                 // res.send(result);
             }
       });
 });


 function sendMessageToUser(deviceId, message,res) {
 var options = {
     method: 'POST',
     url: 'https://fcm.googleapis.com/fcm/send',
     headers: {
       'Content-Type' :' application/json',
       'Authorization': 'key=AAAAOSqYsUg:APA91bEin90FtJgx2XkVm9qiWiFr13AJ1Eu59wzRI-JF_zD-zT3PdbhvGGXetwWBiDPeybYuceiu0iktCIp6XOeckl3kRtT7uM-yR9YFh1RaKVofFnw4J5NyFDEfpOnMlsRYCG4tLTL4'
     },body:JSON.stringify(
       { "notification": {
         "body": message
       },
         "to" : deviceId
       }),
     resolveWithFullResponse: true
 };
 // res.send(deviceId);
 rp(options).then(function (response) {
         // test = body;
         res.send(response);
     }).catch(function (err) {
         // test = body;
         res.send(err);
     });
 }


router.get('/offline-users', function (req, res) {
    User.find({
        type: "driver"
    }, function (err, users) {
        return res.json({
            success: true,
            users: users
        });
    });
});

router.get('/existing-buses', function (req, res) {
    Bus.find(function (err, bus) {
        return res.json({
            success: true,
            buses: bus
        });
    });
});



//Authenticate (Gives back a token)
// For Login
router.post('/authenticate', (req, res, next) => {
    // Get Username, Password thats been submitted
    const username = req.body.username;
    const password = req.body.password;
    var fcm_token =  req.body.fcm_token;
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
                const token = jwt.sign(user, config.secret, {
                    expiresIn: 604800 // Login Expires after a week (this in seconds) 
                });


                getBus(user.bus_no).then(function (result) {
                    return getTrip(result);
                }).then(function (result) {

                   res.json({
                       success: true,
                       token: 'JWT ' + token,
                       user: { //Returning User Data without the password
                           id: user._id,
                           name: user.name,
                           username: user.username,
                           type: user.type,
                           login_time: user.login_time,
                           bus_no: user.bus_no,
                           assigned_region: user.assigned_region,
                           fcm_token: user.fcm_token,
                           last_trip_details: result
                       }
                   });
                })

                if (fcm_token != null && fcm_token != ""){
                    user.fcm_token = fcm_token;
                }

                user.login_time = getDateTime();
                // user.login_time = req.body.login_time;
                // user.bus_no = req.body.bus_no;
                return user.save(function (err) {
                    if (!err) {
                        console.log("Great");
                    } else {
                        console.log(err);
                    }
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


let getBus = function (bus_no) {
    return new Promise(function (resolve) {
        var bus;
        bus = Bus.findOne({
            bus_num: bus_no
        }).exec();
        resolve(bus);
    });
};


let getTrip = function (busObject) {
    return new Promise(function (resolve, reject) {
    var trip = Trip.findOne({
            'bus_id': busObject.id
        }).sort({created_at: -1}).exec()
        resolve(trip);
    });
};
module.exports = router;