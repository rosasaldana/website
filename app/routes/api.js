/*
    This file contains the backend routes that are called by the front-end to contact the database.
    Routes are specified by http://<url>/api/<route>
*/
var User = require('../models/user');
var jwt = require('jsonwebtoken'); //Used to keep the user logged in with cookies
var secret = "GreatFiveTokenGenerator";


module.exports = function(router) {

    //User registration route
    //Handles the route for http://<url>/api/users
    router.post('/users', function(req, res) {
        var user = new User();
        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;

        if (req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == '' || req.body.email == null || req.body.email == '') {
            res.json({
                success: false,
                message: 'Ensure username, email, and password were provided'
            })
        } else {
            user.save(function(err) {
                if (err) {
                    res.json({
                        success: false,
                        message: 'Username or Email already exists!'
                    });
                } else {
                    res.send({
                        success: true,
                        message: "Successfully created a user!"
                    });
                }
            });
        }
    });

    //User Login Routes
    //http://<url>/api/authenticate
    router.post('/authenticate', function(req, res) {
        User.findOne({
            username: req.body.username
        }).select('email username password').exec(function(err, user) {
            if (err) throw err;

            if (!user) {
                res.send({
                    success: false,
                    message: "Could not authenticate user"
                });
            } else if (req.body.password != null && !user.comparePassword(req.body.password)) {
                res.send({
                    success: false,
                    message: "Could not authenticate password"
                });
            } else {
                var token = jwt.sign({
                    username: user.username,
                    email: user.email
                }, secret, {
                    expiresIn: '2 days'
                });
                res.send({
                    success: true,
                    message: "User authenticated",
                    token: token
                });
            }
        });
    });

    //Middleware for the route /api/currentUser to check the status of the token
    router.use('/currentUser', function(req, res, next) {
        var token = req.body.token || req.body.query || req.headers['x-access-token'];

        if (token) {
            jwt.verify(token, secret, function(err, decoded) {
                if (err) {
                    res.json({
                        success: false,
                        message: 'Token invalid'
                    });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.json({
                success: false,
                message: "No token provided"
            });
        }
    });

    //Verifying token route
    //http://<url>/api/currentUser
    router.post('/currentUser', function(req, res) {
        res.send(req.decoded);
    });


    return router;
}
