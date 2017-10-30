const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // this for encryption
const config = require('../config/database');

// Trip Schema
const TripSchema = mongoose.Schema({
    start_time: {
        type: String,
        required: true
    },
    start_location: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    bus_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus'
    },
    end_time: {
        type: String,
        default: null
    },
    end_location: {
        type: String,
        default: null
    },
    trip_completed: {
        type: Boolean,
        default: false
    },
    created_at: {
        type:Date,
        default: Date.now
    }

});


// module.exports So we can use the variable from outside
// Mongoose.model (here you put your table name in the ' ') and you pass the Schema Variable
const Trip = module.exports = mongoose.model('Trip', TripSchema);