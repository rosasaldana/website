var FacebookStrategy = require('passport-facebook').Strategy;
var User             = require('../models/user');
var session          = require('express-session')
var jwt = require('jsonwebtoken'); //Used to keep the user logged in with cookies
var secret = "GreatFiveTokenGenerator";


module.exports = function(app, passport){

	app.use(passport.initialize());
	app.use(passport.session());
	app.use(session({
		secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { secure: false }
	}))

	passport.serializeUser(function(user, done) {
		token = jwt.sign({username: user.username, email: user.email }, secret, { expiresIn: '2 days' });
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use(new FacebookStrategy({
		clientID: '1137639219727763',
		clientSecret: '0a436cfaa42ea670ef5d95c9569abb33',
		callbackURL: "https://pixmapworld.herokuapp.com/auth/facebook/callback",
		profileFields: ['id', 'displayName', 'photos', 'email']
	},

	function(accessToken, refreshToken, profile, done) {
		User.findOne({email: profile._json.email}).select('username password email').exec(function(err,user){
			if(err) done(err);
			if(user && user != null){
				done(null, user);
			} else{
				done(err);
			}
		});
	}
	));

	app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebookerror' }), function(req, res){
		res.redirect('/facebook/' + token);
	});

	app.get('/auth/facebook',
		passport.authenticate('facebook', { scope: 'email' }));

	return passport;
}
