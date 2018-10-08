var User = require('../models/user');
module.exports = function(router) {

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

  return router;
}
