/*
    This file contains the backend routes that are called by the front-end to contact the database.
    Routes are specified by http://<url>/user-api/<route>
*/
var User = require('../models/user');
var jwt = require('jsonwebtoken'); //Used to keep the user logged in with cookies
var secret = "GreatFiveTokenGenerator";
var bcrypt = require('bcrypt-nodejs');

module.exports = function(router) {

    //User registration route
    //Handles the route for http://<url>/user-api/users
    router.post('/users', function(req, res) {
        var user = new User();
        user.username = req.body.username;
        user.email = req.body.email;
        bcrypt.hash(req.body.password, null, null, function(err, hash) {
            if(err) return next(err);
            user.password = hash;
        });

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
                        message: 'Username or Email already exists!' + err
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
    //http://<url>/user-api/authenticate
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
            }
            else if(req.body.password == null){
                res.send({
                    success: false,
                    message: "Password not entered"
                });
            }
            else if(!user.comparePassword(req.body.password)) {
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

    //Route to obatin all user information
    //http://<url>/user-api/getUserInfo
    router.get('/getUserInfo/:user', function(req, res){
        User.findOne({username: req.params.user}, function(err, data){
            if(err) throw err;

            if(data) res.send(data);
            else res.json({
                success: false,
                message: "User does not exist"
            });
        });
    });

    //Route to obtain display name
    //http://<url>/user-api/getDisplayName
    router.get('/getDisplayName/:user', function(req, res){
        User.findOne({username: req.params.user}, '-_id username displayName', function(err, user){
            if(err) throw err;

            if(user){
                res.send(user);
            } else {
                res.json({
                    success: false,
                    message: "User does not exist"
                });
            }
        });
    });

    //Route to update profile information
    //http://<url>/user-api/updateProfile
    router.put('/updateProfile', function(req, res){
        var displayName = (!req.body.displayName || req.body.displayName.length == 0) ? undefined : req.body.displayName;
        var email = (!req.body.email || req.body.email.length == 0) ? undefined : req.body.email;

        if(!displayName && !email){
            res.json({
                success: false,
                message: "No data was provided"
            });
        }
        else{
            User.findOne({username: req.body.username}, function(err, user){
                if(user){
                    user.displayName = (displayName) ? displayName : user.displayName;
                    user.email = (email) ? email : user.email;
                    user.save(function(err){
                        if(err){
                            res.json({
                                success: false,
                                message: "Error updating profile"
                            });
                        } else{
                            res.json({
                                success: true,
                                message: "Successfully updated profile"
                            });
                        }
                    });
                }
            });
        }
    });

    //Route to update password
    //http://<url>/user-api/updatePassword
    router.put('/updatePassword', function(req, res){
        var newPassword;
        bcrypt.hash(req.body.newPassword, null, null, function(err, hash) {
            if(err) return next(err);
            newPassword = hash;
        });

        User.findOne({username: req.body.username}, function(err, user){
            if(!user){
                res.json({
                    success: false,
                    message: "User not found"
                })
            } else{
                if(!user.comparePassword(req.body.oldPassword)){
                    res.json({
                        success: false,
                        message: "Password authentication failed"
                    });
                } else{
                    user.password = newPassword;
                    console.log(user.password, newPassword);
                    user.save(function(err){
                        if(err){
                            res.json({
                                success: false,
                                message: "Failed updating password"
                            });
                        } else{
                            res.json({
                                success: true,
                                message: "Updated password"
                            });
                        }
                    });
                }
            }
        });
    });

    //Middleware for the route /user-api/currentUser to check the status of the token
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
    //http://<url>/user-api/currentUser
    router.get('/currentUser', function(req, res) {
        res.send(req.decoded);
    });

    //Retrieving all users except current user
    //http://<url>/user-api/getAllUsers
    router.get('/getAllUsers/:currentUser', function(req, res){
        var allUsers = {
            username: [],
            displayName: []
        };

        User.find({}, '-_id username displayName', function(err, users){
            if(err) throw err;
            for(index in users){
                if(users[index].username != req.params.currentUser){
                    if(users[index].displayName) allUsers.displayName.push(users[index].displayName);
                    else allUsers.displayName.push(users[index].username);
                    allUsers.username.push(users[index].username);
                }
            }
            res.send(allUsers);
        });
    });

    //Retrieving friends from a user
    //http://<url>/user-api/getFriends
    router.get('/getFriends/:user', function(req, res){
        User.find({username: req.params.user}, '-_id following', function(err, data){
            if(err) throw err;
            res.send(data);
        });
    });

    //Middleware for following a user and unfollowing a user
    router.use(function(req, res, next){
        if(req.body.username && req.body.followingUser){
            User.findOne({username: req.body.followingUser}, function(err, followingUser){
                if (err) throw err;
                if(followingUser){
                    req.followingUser = followingUser;
                }
                else{
                    req.error = "Following user does not exist in database";
                }
                next();
            });
        }
        else{
            req.error = "Ensure that user and the requested user are specified";
            next();
        }
    });

    //Route to follow a user
    //http://<url>/user-api/connectUser
    router.put('/followUser', function(req, res){
        if(req.error){
            res.json({
                success: false,
                message: req.error
            });
        }
        else{
            User.findOne({username: req.body.username}, function(err, user){
                if(err) throw err;

                if(user){
                    if(user.following.users.indexOf(req.followingUser.username) != -1){
                        res.json({
                            success: false,
                            message: 'Already following user'
                        });
                    }
                    else{
                        user.following.users.push(req.followingUser.username);
                        user.save(function(err){
                            if(err){
                                res.json({
                                    success: false,
                                    message: 'Unable to follow'
                                });
                            }
                            else{
                                res.json({
                                    success: true,
                                    message: 'Successfully followed user'
                                });
                            }
                        })
                    }
                }
                else{
                    res.json({
                        success: false,
                        message: 'User does not exist'
                    });
                }
            });
        }
    });

    //Route to unfollow a user
    //http://<url>/user-api/unfollowUser
    router.put('/unfollowUser', function(req, res){
        if(req.error){
            res.json({
                success: false,
                message: req.error
            });
        }
        else{
            User.findOne({username: req.body.username}, function(err, user){
                if(err) throw err;

                if(user){
                    var index = user.following.users.indexOf(req.followingUser.username);
                    if(index != -1){
                        user.following.users.splice(index, 1);
                        user.save(function(err){
                            if(err){
                                res.json({
                                    success: false,
                                    message: 'Unable to unfollow'
                                });
                            }
                            else{
                                res.json({
                                    success: true,
                                    message: 'Successfully unfollowed'
                                })
                            }
                        });
                    }
                    else{
                        res.json({
                            success: false,
                            message: 'Unable to unfollow'
                        });
                    }
                }
                else{
                    res.json({
                        success: false,
                        message: 'User does not exist'
                    });
                }
            });
        }
    });

    return router;
}
