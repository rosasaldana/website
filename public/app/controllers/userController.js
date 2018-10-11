/*
    This file contains the defintion for the userController, used as userCtrl
    Contains all needed functions for a user and communicates with userServices to access backend
*/
angular.module('userController', ['userServices'])

    .controller('userCtrl', function($http, $location, $timeout, User){
        var app = this;

        //Function to register a user
        //This function is called in register.html
        app.regUser = function(regData){
            app.successMsg = app.errorMsg = false;
            app.loading = true;

            //Calling to the userServices to registerUser, in userServices.js
            User.registerUser(app.regData).then(function(data) {
                app.loading = false;
                if (data.data.success) {
                    app.successMsg = data.data.message;

                    //Redirecting to home page with two second delay after registration
                    $timeout(function() {
                        $location.path('/home');
                    }, 2000);
                } else {
                    app.errorMsg = data.data.message;
                }
            });
        };

        //Function to login a user
        //This funciton is called in login.html
        app.logIn = function(loginData) {
            app.successMsg = app.errorMsg = false;
            app.loading = true;

            User.loginUser(app.loginData).then(function(data) {
                app.loading = false;
                if (data.data.success) {
                    app.successMsg = data.data.message;

                    //Redirecting to home page with two second delay
                    $timeout(function() {
                        $location.path('/profile');
                        app.successMsg = app.loginData = '';
                    }, 2000);
                } else {
                    app.errorMsg = data.data.message;
                }
            });
        }
    });
