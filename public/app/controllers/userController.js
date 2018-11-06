/*
    This file contains the defintion for the userController, used as userCtrl
    Contains all needed functions for a user and communicates with userServices to access backend
*/
angular.module('userController', ['userServices'])

    .controller('userCtrl', function($http, $location, $timeout, User){
        var user = this;

        //Function to register a user
        //This function is called in register.html
        user.regUser = function(regData){
            user.successMsg = user.errorMsg = false;
            user.loading = true;

            //Calling to the userServices to registerUser, in userServices.js
            User.registerUser(user.regData).then(function(data) {
                user.loading = false;
                if (data.data.success) {
                    user.successMsg = data.data.message;

                    //Redirecting to home page with two second delay after registration
                    $timeout(function() {
                        $location.path('/home');
                    }, 2000);
                } else {
                    user.errorMsg = data.data.message;
                }
            });
        };

        //Function to login a user
        //This funciton is called in login.html
        user.logIn = function(loginData) {
            user.successMsg = user.errorMsg = false;
            user.activationLink = false;
            user.loading = true;

            User.loginUser(user.loginData).then(function(data) {
                user.loading = false;
                // if(data.data.expired) user.activationLink = true;
                if (data.data.success) {
                    user.successMsg = data.data.message;

                    //Redirecting to home page with two second delay
                    $timeout(function() {
                        $location.path('/profile');
                        user.successMsg = user.loginData = '';
                    }, 1000);
                } else {
                    user.errorMsg = data.data.message;
                }
            });
        }
    });
