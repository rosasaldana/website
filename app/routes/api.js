var User = require('../models/user');
module.exports = function(router) {

  //Handles the route for http://<url>/api/users
  router.post('/users', function(req, res){
    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;
    user.email = req.body.email;

    if(req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == '' || req.body.email == null || req.body.email == ''){
      res.send('Missing field!');
    }
    else{
      user.save(function(err){
        if(err){
          res.send('Username or Email already exists!');
        }
        else{
          res.send("Successfully created a user!");
        }
      });
    }
  });

  return router;
}
