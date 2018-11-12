/*
    This file contains the backend routes that are called by the front-end to contact the database.
    Routes are specified by http://<url>/user-api/<route>
*/
var User = require('../models/user');
var jwt = require('jsonwebtoken'); //Used to keep the user logged in with cookies
var secret = "GreatFiveTokenGenerator";
var bcrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer');

//gmail account used to send messages
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pixmapteam@gmail.com',
        pass: 'randomPassword123!'
    }
});

module.exports = function(router) {

    //User registration route
    //Handles the route for http://<url>/user-api/users
    router.post('/users', function(req, res) {
        var user = new User();
        user.username = req.body.username;
        user.email = req.body.email;
        user.temporaryToken = jwt.sign({username: user.username,email: user.email}, secret, {expiresIn: '2 days'});
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
                    var message;
                    console.log(err);
                    if(err.errors != null){
                        if(err.errors.displayName) message = err.errors.displayName.message;
                        else if(err.errors.email) message = err.errors.email.message;
                        else if(err.errors.username) message = err.errors.username.message;
                        else message = err;
                    } else{
                        console.log(err);
                        message = "Username or E-mail already exists";
                    }
                    res.json({
                        success: false,
                        message: message
                    });
                } else {
                    const mailOptions = {
                        from: 'pixmapteam@gmail.com', // sender address
                        to: user.email, // list of receivers
                        subject: 'PixMap: Authenticate Account', // Subject line
                        text:'Hello '+ user.username + 'Thank you for registering at PixMap. Please ' +
                        'click on the link below to compelete your activation:"http://localhost:8080/activate/' + user.temporaryToken,
                        html: 'Hello<strong> '+ user.username + '</strong>, <br><br>Thank you for registering at PixMap. Please ' +
                        'click on the link below to compelete your activation: <br><br><a href="http://localhost:8080/activate/' + user.temporaryToken + '">http://localhost:8080</a>'
                    };
                    transporter.sendMail(mailOptions, function(err, info){
                        if(err) console.log(err);
                        else console.log(info);
                    });
                    res.send({
                        success: true,
                        message: "Account registered! Please check your e-mail for activation link."
                    });
                }
            });
        }
    });

    //Account activation route
    //http://<url>/user-api/activate
    router.put('/activate/:token', function(req, res){
        User.findOne({temporaryToken: req.params.token}, function(err, user){
            if(err) throw err;
            var token = req.params.token;

            jwt.verify(token, secret, function(err, decoded) {
                if (err) {
                    res.send({
                        success: false,
                        message: 'Activation link has expired.'
                    });
                } else if(!user) {
                    res.send({
                        success: false,
                        message: 'Activation link has expired.'
                    });
                } else{
                    user.temporaryToken = false;
                    user.active = true;
                    user.save(function(err){
                        if(err) throw err;
                        else{
                            const mailOptions = {
                                from: 'pixmapteam@gmail.com', // sender address
                                to: user.email, // list of receivers
                                subject: 'PixMap: Account Authenticated', // Subject line
                                text:'Hello '+ user.username + ' Your account has been activated',
                                html: 'Hello<strong> '+ user.username + '</strong>, <br><br>Your account has been activated'
                            };
                            transporter.sendMail(mailOptions, function(err, info){
                                if(err) console.log(err);
                                else{
                                    res.send({
                                        success: true,
                                        message: 'Account activated'
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    //User Login Routes
    //http://<url>/user-api/authenticate
    router.post('/authenticate', function(req, res) {
        User.findOne({username: req.body.username}).select('email username password active').exec(function(err, user) {
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
            } else if(!user.active){
                res.send({
                    success: false,
                    expired: true,
                    message: "Account is not yet activated. Please check your e-mail for activation link."
                });
            }
            else {
                var token = jwt.sign({
                    username: user.username,
                    email: user.email
                }, secret, {
                    expiresIn: '2 days'
                });
                res.json({
                    success: true,
                    message: "User authenticated",
                    token: token
                });
            }
        });
    });

    //Route to resend activation link
    //http://<url>/user-api/resend
    router.post('/resend', function(req, res) {
        User.findOne({username: req.body.username}, function(err, user) {
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
            } else if(user.active){
                res.send({
                    success: false,
                    message: "Account is already activated."
                });
            }
            else {
                console.log(user);
                user.temporaryToken = jwt.sign({username: user.username,email: user.email}, secret, {expiresIn: '2 days'});
                user.save(function(err){
                    if(err) throw err;
                    else{
                        const mailOptions = {
                            from: 'pixmapteam@gmail.com', // sender address
                            to: user.email, // list of receivers
                            subject: 'PixMap: Authentication Link Request', // Subject line
                            text:'Hello '+ user.username + ' You recently requested a new account activation link. Please click ' +
                            'on the following link to compete your activation: "http://localhost:8080/activate/' + user.temporaryToken,
                            html: 'Hello<strong> '+ user.username + '</strong>, <br><br>You recently requested a new account activation link. Please click ' +
                            'on the following link to compete your activation: <br><br><a href="http://localhost:8080/activate/' + user.temporaryToken + '">http://localhost:8080</a>'
                        };
                        transporter.sendMail(mailOptions, function(err, info){
                            if(err) console.log(err);
                            else {
                                res.json({
                                    success: true,
                                    message: "Activation link was sent. Please check your email"
                                });
                            }
                        });
                    }
                });
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
                var name = (user.displayName) ? user.displayName : user.username;
                res.json({
                    success: true,
                    username: user.username,
                    displayName: name
                });
            } else {
                res.json({
                    success: false,
                    message: "User does not exist",
                    username: req.params.user
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

    //Delete account
    //http://<url>/user-api/deleteAccount
    router.put('/deleteAccount', function(req, res){
        User.findOne({username: req.body.username}, function(err, user){
            if(err) throw err;

            if(user == null){
                res.json({
                    success: false,
                    message: "Could not confirm user"
                })
            }
            else if(!user.comparePassword(req.body.password)){
                res.json({
                    success: false,
                    message: "Could not confirm password"
                });
            } else{
                User.findOneAndRemove({username: req.body.username}, function(err){
                    if(err) throw err;
                    res.json({
                        success: true,
                        message: "Successfully deleted user"
                    });
                });
            }
        });
    });

    //Middleware for following a user and unfollowing a user
    router.use('/followUser', function(req, res, next){
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
            console.log('here');
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
        if(!req.body.username && !req.body.followingUser){
            res.json({
                success: false,
                message: "Ensure username and followingUser is provided"
            });
        }
        else{
            User.findOne({username: req.body.username}, function(err, user){
                if(err) throw err;

                if(user){
                    var index = user.following.users.indexOf(req.body.followingUser);
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
