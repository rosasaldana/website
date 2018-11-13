angular.module('activationController', ['userServices'])

    .controller('emailController', function($routeParams, $timeout, $window, User){
        var email = this;
        var token = $routeParams.token;

        User.activeAccount(token).then(function(response){
            email.successMsg = email.errorMsg = false;
            if(response.data.success){
                email.successMsg = response.data.message + '...Redirecting';
                $timeout(function() {
                    $window.location.href = '/login'
                }, 500);
            } else{
                email.errorMsg = response.data.message;
            }
        });
    })

    .controller('resendController', function(User){
        var resend = this;

        resend.resendLink = function(data){
            resend.errorMsg = resend.successMsg = false;
            User.resendActivationLink(data).then(function(response){
                if(response.data.success){
                    resend.successMsg = response.data.message;
                }
                else{
                    resend.errorMsg = response.data.message;
                }
            });
        }
    });
