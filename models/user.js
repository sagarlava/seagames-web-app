const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // this for encryption
const config = require('../config/database');

// User Schema
const UserSchema = mongoose.Schema({
    name: {
        type: String
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    type: {
        type: String,
        required: true
    },
    login_time: {
        type: String,
        default: "No Record"
    },
    fcm_token:{
        type: String,
        default: null
    },
    bus_no: {
        type: String,
        default: null
    },
    assigned_region: {
        type: String,
        default: null
    }
});


// module.exports So we can use the variable from outside
// Mongoose.model (here you put your table name in the ' ') and you pass the Schema Variable
const User = module.exports = mongoose.model('User', UserSchema);


// module.exports So we can use the Function from outside
// findById is mongoose function
module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

module.exports.getUserByUsername = function (username, callback) {
        //create query because we gonna use a findOne function
        const query = {
            username: username
        }
        User.findOne(query, callback);
    }
    //genSalt is a random key that used to hash the password
module.exports.addUser = function (newUser, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

//Compare Password
module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    });
}

module.exports.firstStep = function () {
    return new Promise(function (resolve, reject) {
        var salts;
        bcrypt.genSalt(10, (err, salt) => {
            salts = salt;
            resolve(salts);
        })
    })
}

module.exports.secondStep = function (salt, password) {
    return new Promise(function (resolve, reject) {
        var passwordx;
        bcrypt.hash(password, salt, (err, hash) => {
            passwordx = hash;
            resolve(passwordx);
        });
    })
}