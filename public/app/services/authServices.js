angular.module('authServices', [])

.factory('Auth', function($http, $q, AuthToken){
  var authFactory = {};

  //Auth.login(loginData) -> function call
  authFactory.login = function(loginData){
    return $http.post('/api/authenticate', loginData).then(function(data){
      AuthToken.setToken(data.data.token);
      return data;
    });
  };

  //Auth.loguout() -> function call
  authFactory.logout = function(){
    AuthToken.deleteToken();
  }

  //Auth.isLoggedIn() -> function call
  authFactory.isLoggedIn = function(){
      if(AuthToken.getToken()){
          return true;
      }
      else{
        return false;
      }
  };

  //Auth.getUser() -> function call
  authFactory.getUser = function(){
    if(AuthToken.getToken()){
      return $http.post('/api/currentUser');
    }
    else{
      $q.reject({ message: 'User has no token' });
    }
  }

  return authFactory;
})

.factory('AuthToken', function($window){
  var authTokenFactory = {};

  //AuthToken.setToken(token) -> function call
  authTokenFactory.setToken = function(token){
    $window.localStorage.setItem('token', token);
  };

  //AuthToken.deleteToken(token) -> function call
  authTokenFactory.deleteToken = function(token){
    $window.localStorage.removeItem('token');
  }

  //AuthToken.getToken() -> function call
  authTokenFactory.getToken = function(){
    return $window.localStorage.getItem('token');
  };

  return authTokenFactory;
})

.factory('AuthInterceptors', function(AuthToken){
  var authInterceptorsFactory = {};

  authInterceptorsFactory.request = function(config){
    var token = AuthToken.getToken();

    if(token) config.headers['x-access-token'] = token;

    return config;
  };

  return authInterceptorsFactory;
});
