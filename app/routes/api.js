var User = require('../models/user');
module.exports = function(router) {

  //User registration route
  //Handles the route for http://<url>/api/users
  router.post('/users', function(req, res){
    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;
    user.email = req.body.email;

    if(req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == '' || req.body.email == null || req.body.email == ''){
      res.json({ success: false, message: 'Ensure username, email, and password were provided'})
    }
    else{
      user.save(function(err){
        if(err){
          res.json({ success: false, message: 'Username or Email already exists!' });
        }
        else{
          res.send({ success: true, message: "Successfully created a user!" });
        }
      });
    }
  });

  //User Login Routes
  //http://<url>/api/authenticate
  router.post('/authenticate', function(req, res){
    User.findOne({username: req.body.username}).select('email username password').exec(function(err, user){
      if(err) throw err;

      if(!user){
        res.send({success: false, message: "Could not authenticate user"});
      }
      else if(req.body.password != null && !user.comparePassword(req.body.password)){
        res.send({ success: false, message: "Could not authenticate password" });
      }
      else{
        res.send({ success: true, message: "User authenticated" });
      }
    });
  });

  return router;
}
