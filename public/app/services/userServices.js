angular.module('userServices', [])

.factory('User', function($http){
  userFactory = {};

  //User.create(regData) -> this is how to call it
  userFactory.create = function(regData){
    return $http.post('/api/users', regData);
  }
  return userFactory;
});
