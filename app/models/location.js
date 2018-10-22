/*
    This file contains the schema definition for location.
*/

var mongoose = require('mongoose');
    Schema = mongoose.Schema;

var LocationSchema = new Schema ({
    address: {
        type: String,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    frequency: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Location', LocationSchema);
