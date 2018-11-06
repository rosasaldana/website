angular.module('emailController', ['userServices'])

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
    });
