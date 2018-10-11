angular.module('userController', ['userServices'])

.controller('registerController', function($http, $location, $timeout, User){
  var app = this;

  app.regUser = function(regData){
    app.successMsg = app.errorMsg = false;
    app.loading = true;

    //registerController.create(regData) -> function call
    User.create(app.regData).then(function(data){
      app.loading = false;
      if(data.data.success){
        app.successMsg = data.data.message;

        //Redirecting to home page with two second delay
        $timeout(function(){
          $location.path('/home');
        }, 2000);
      }
      else{
        app.errorMsg = data.data.message;
      }
    });
  };
});
