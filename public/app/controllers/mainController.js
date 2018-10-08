angular.module('mainController', ['authServices'])

.controller('mainCtrl', function(Auth, $timeout, $location){
  var app = this;

  app.logIn = function(loginData){
    app.successMsg = app.errorMsg = false;
    app.loading = true;

    Auth.login(app.loginData).then(function(data){
      app.loading = false;
      if(data.data.success){
        app.successMsg = data.data.message;

        //Redirecting to home page with two second delay
        $timeout(function(){
          $location.path('/about');
        }, 2000);
      }
      else{
        app.errorMsg = data.data.message;
      }
    });
  };
});
