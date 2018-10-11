/*
    This file contains functions related to user requests
    Communicates with authServices to get user tokens know if user is logged in or to log out user
*/

angular.module('userServices', ['authServices'])

    //Factory to register and login a user in the database
    //Called in userController.js
    .factory('User', function($http, AuthToken) {
        userFactory = {};

        //User.registerUser(regData) -> this is how to call it
        userFactory.registerUser = function(regData) {
            return $http.post('/api/users', regData);
        }

        //User.loginUser() -> function call
        userFactory.loginUser = function(loginData) {
            return $http.post('/api/authenticate', loginData).then(function(data) {
                AuthToken.setToken(data.data.token);
                return data;
            })
        }

        //User.isLoggedIn() -> function call
        userFactory.isLoggedIn = function() {
            if (AuthToken.getToken()) {
                return true;
            } else {
                return false;
            }
        }

        //User.logout() -> function call
        userFactory.logout = function() {
            AuthToken.deleteToken();
        }

        //User.getUser() -> function call
        userFactory.getUser = function() {
            if (AuthToken.getToken()) {
                return $http.post('/api/currentUser');
            } else {
                $q.reject({
                    message: 'User has no token'
                });
            }
        }

        return userFactory;
    });
