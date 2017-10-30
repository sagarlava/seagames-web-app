const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // this for encryption
const config = require('../config/database');

// Passenger Schema
const NotificationSchema = mongoose.Schema({
    trip_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip'
    },
    issue: {
        type: String,
        required: true
    },
    bus_num: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date_time: {
        type: String,
        required: true
    }

});


// module.exports So we can use the variable from outside
// Mongoose.model (here you put your table name in the ' ') and you pass the Schema Variable
const Notification = module.exports = mongoose.model('Notification', NotificationSchema);