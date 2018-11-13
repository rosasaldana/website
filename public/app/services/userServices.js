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
            return $http.post('/user-api/users', regData);
        }

        //User.loginUser() -> function call
        userFactory.loginUser = function(loginData) {
            return $http.post('/user-api/authenticate', loginData).then(function(data) {
                AuthToken.setToken(data.data.token);
                return data;
            })
        }

        //User.isLoggedIn() -> function call
        userFactory.isLoggedIn = function() {
            var token = AuthToken.getToken();
            if (token && token != "undefined") {
                return true;
            } else {
                return false;
            }
        }

        // Auth.facebook(token);
        userFactory.facebook = function(token) {
            AuthToken.setToken(token);
        }

        //User.logout() -> function call
        userFactory.logout = function() {
            AuthToken.deleteToken();
        }

        //User.getUser() -> function call
        userFactory.getUser = function() {
            if (AuthToken.getToken()) {
                return $http.get('/user-api/currentUser');
            } else {
                $q.reject({
                    message: 'User has no token'
                });
            }
        }

        //User.checkEmail -> funciton call
        userFactory.checkEmail = function(data){
            return $http.post('/user-api/checkemail', data);
        }

        //User.activeAccount -> function call
        userFactory.activeAccount = function(token){
            return $http.put('/user-api/activate/' + token);
        }

        //User.resendActivationLink -> function call
        userFactory.resendActivationLink = function(data){
            return $http.post('/user-api/resend', data);
        }

        //User.getUserInfo() -> function call
        userFactory.getUserInfo = function(user){
            return $http.get('/user-api/getUserInfo/' + user);
        }

        //User.getAllUsers() -> function call
        userFactory.getAllUsers = function(user) {
            return $http.get('/user-api/getAllUsers/' + user);
        }

        //User.getFriends() -> function call
        userFactory.getFriends = function(user){
            return $http.get('/user-api/getFriends/' + user);
        }

        //User.addFriend() -> function call
        userFactory.addFriend = function(followingUserData){
            return $http.put('/user-api/followUser', followingUserData);
        }

        //User.removeFriend() -> function call
        userFactory.removeFriend = function(unfollowUserData){
            return $http.put('/user-api/unfollowUser', unfollowUserData);
        }

        //User.updateProfile() -> function call
        userFactory.updateProfile = function(profileData){
            return $http.put('/user-api/updateProfile', profileData);
        }

        //User.updatePassword() -> function call
        userFactory.updatePassword = function(passwordData){
            return $http.put('/user-api/updatePassword', passwordData);
        }

        //User.getDisplayName() -> function call
        userFactory.getDisplayName = function(user){
            return $http.get('/user-api/getDisplayName/' + user);
        }

        //User.deleteAccount() -> function call
        userFactory.deleteAccount = function(user){
            return $http.put('/user-api/deleteAccount', user);
        }

        //User.getAvatarColor() -> function call
        userFactory.getAvatarColor = function(id){
            var map = { 1: "#0085c3", 2: "#dc5034", 3: "#009f4d", 4: "#5482ab",
            5: "#057855", 6: "#0077c8", 7: "#b84592", 8: "#537b35"};

            if(id >= 'A' && id <= 'C') id = 1;
            else if(id >= 'D' && id <= 'F') id = 2;
            else if(id >= 'G' && id <= 'I') id = 3;
            else if(id >= 'J' && id <= 'M') id = 4;
            else if(id >= 'N' && id <= 'P') id = 5;
            else if(id >= 'Q' && id <= 'S') id = 6;
            else if(id >= 'T' && id <= 'V') id = 7;
            else if(id >= 'W' && id <= 'Z') id = 8;

            return map[id];
        }

        return userFactory;
    });
