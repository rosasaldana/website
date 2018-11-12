/*
    This file contains the schema definition for and imagepost.
*/

var mongoose = require('mongoose');
var gridStore = require("mongoose-gridstore");
var Schema = mongoose.Schema;

var ImagePostSchema = new Schema ({
    imgTitle: String,
    imgDescription: String,
    imgRef: [Schema.Types.ObjectId],
    imgLocation: String,
    username: String,
    likeCount: Number,
    heartstatus: String,
    likes: [],
    comments: [{
    	user: String,
    	message: String
    }]
});

ImagePostSchema.plugin(gridStore);

module.exports = mongoose.model('ImagePost', ImagePostSchema);