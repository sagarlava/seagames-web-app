const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // this for encryption
const config = require('../config/database');

// Trip Schema
const BusSchema = mongoose.Schema({
    bus_num: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    assigned_driver: {
        type: String,
        required: true
    }

});


//genSalt is a random key that used to hash the password
module.exports.addBus = function (newBus, callback) {
    newBus.save(callback);
}
    // module.exports So we can use the variable from outside
    // Mongoose.model (here you put your table name in the ' ') and you pass the Schema Variable
const Bus = module.exports = mongoose.model('Bus', BusSchema);