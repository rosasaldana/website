angular.module('mainController', ['authServices'])

.controller('mainCtrl', function(Auth, $timeout, $location, $rootScope){
  var app = this;
  app.loadingData = true;

  //On every route change checking if the user is logged in
  $rootScope.$on('$routeChangeStart', function(){
    if(Auth.isLoggedIn()){
      Auth.getUser().then(function(data){
        app.isLoggedIn = true;
        app.username = data.data.username;
        app.email = data.data.email;
      });
    }
    else{
      app.isLoggedIn = false;
      app.username = '';
      app.email = '';
    }
    app.loadingData = false;

    //Force scrolling to the top of the page, when we load a new page to the screen
    window.scrollTo(0, 0);
  });


  app.logIn = function(loginData){
    app.successMsg = app.errorMsg = false;
    app.loading = true;

    Auth.login(app.loginData).then(function(data){
      app.loading = false;
      if(data.data.success){
        app.successMsg = data.data.message;

        //Redirecting to home page with two second delay
        $timeout(function(){
          $location.path('/profile');
          app.successMsg = app.loginData = '';
        }, 2000);
      }
      else{
        app.errorMsg = data.data.message;
      }
    });
  };

  app.logout = function(){
    Auth.logout();
    $location.path('/logout');
    $timeout(function(){
      $location.path('/home')
    }, 2000);
  };

});
