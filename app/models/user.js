/*
    This file contains the schema definition for a user, a function to encrypt the
    password for a user prior to storing a user to the database, and a method to
    decrypt the password stored in the database to compare to a password entered
    when a user is logging in.
*/
var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    gridStore = require('mongoose-gridstore'),
    Schema = mongoose.Schema,
    validate = require('mongoose-validator');


// User Name Validator
var nameValidator = [
    validate({
        validator: 'matches',
        arguments: /^(([a-zA-Z]{3,20})+[ ]+([a-zA-Z]{3,20})+)+$/,
        message: 'Name must be at least 3 characters, max 30, no special characters or numbers, must have space in between name.'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 20],
        message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

// User E-mail Validator
var emailValidator = [
    validate({
        validator: 'matches',
        arguments: /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/,
        message: 'Invalid email format'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 40],
        message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

// Username Validator
var usernameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 25],
        message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
    }),
    validate({
        validator: 'matches',
        arguments: /^([a-zA-Z]{3,20})+([0-9]{0,})$/,
        message: 'Username must contain at least 3 characters, no special characters'
    })
];

var UserSchema = new Schema({
    displayName: {
        type: String,
        validate: nameValidator
    },
    username: {
        type: String,
        required: true,
        unique: true,
        validate: usernameValidator
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: emailValidator
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
