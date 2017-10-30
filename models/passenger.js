const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // this for encryption
const config = require('../config/database');

// Passenger Schema
const PassengerSchema = mongoose.Schema({
    trip_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip'
    },
    passenger_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    board_time: {
        type: String,
        required: false
    },
    board_location: {
        type: String,
        required: false
    },
    nric: {
        type: String,
        required: true
    },
    contingent: {
        type: String,
        required: false
    },
    sport: {
        type: String,
        required: false
    },
    tagID: {
        type: String,
        required: true
    },
    post: {
        type: String,
        required: false
    },
    access: {
        type: String,
        required: false
    },
    depart_time: {
        type: String,
        default: null
    },
    depart_location: {
        type: String,
        default: null
    }

});

// module.exports So we can use the variable from outside
// Mongoose.model (here you put your table name in the ' ') and you pass the Schema Variable
const Passenger = module.exports = mongoose.model('Passenger', PassengerSchema);