/*
    This file contains the schema definition for a user, a function to encrypt the
    password for a user prior to storing a user to the database, and a method to
    decrypt the password stored in the database to compare to a password entered
    when a user is logging in.
*/
var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    gridStore = require('mongoose-gridstore'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    displayName: {
        type: String
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profilePicture: {
        type: String
    },
    following: {
        users: [String]
    }
});

UserSchema.plugin(gridStore);

//Function to authenticate password from user
//Input is password from user and output is a boolean
UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);
