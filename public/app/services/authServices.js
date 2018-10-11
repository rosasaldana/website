/*
    This function contains services for authenticating a given user.
    Accessed by userServices
*/
angular.module('authServices', [])

    //Factory that authenticates a given users token
    .factory('AuthToken', function($window) {
        var authTokenFactory = {};

        //Sets the token item in the browser
        //AuthToken.setToken(token) -> function call
        authTokenFactory.setToken = function(token) {
            $window.localStorage.setItem('token', token);
        };

        //Deletes the token stored in the browsers cookies
        //AuthToken.deleteToken(token) -> function call
        authTokenFactory.deleteToken = function(token) {
            $window.localStorage.removeItem('token');
        }

        //Retrieves the token stored in the browsers cookie
        //AuthToken.getToken() -> function call
        authTokenFactory.getToken = function() {
            return $window.localStorage.getItem('token');
        };

        return authTokenFactory;
    })

    //Factory that stores the token into the headers of http requests for easy
    //verification of token in the backend
    .factory('AuthInterceptors', function(AuthToken) {
        var authInterceptorsFactory = {};

        authInterceptorsFactory.request = function(config) {
            var token = AuthToken.getToken();

            if (token) config.headers['x-access-token'] = token;

            return config;
        };

        return authInterceptorsFactory;
    });
