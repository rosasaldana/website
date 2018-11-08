var app = angular.module('appRoutes', ['ngRoute'])

    .config(function($routeProvider, $locationProvider) {

        $routeProvider
            .when('/', {
                templateUrl: 'app/views/pages/home.html'
            })
            .when('/contact', {
                templateUrl: 'app/views/pages/contact.html',
                controller: 'contactCtrl',
                controllerAs: 'contactCtrl'
            })
            .when('/about', {
                templateUrl: 'app/views/pages/about.html',
                controller: 'aboutCtrl',
                controllerAs: 'aboutCtrl'
            })
            .when('/register', {
                templateUrl: 'app/views/pages/users/register.html',
                controller: 'userCtrl',
                controllerAs: 'userCtrl'
            })
            .when('/login', {
                templateUrl: 'app/views/pages/users/login.html',
                controller: 'userCtrl',
                controllerAs: 'userCtrl'
            })
            .when('/logout', {
                templateUrl: 'app/views/pages/users/logout.html'
            })
            .when('/profile', {
                templateUrl: 'app/views/pages/users/profile.html',
                controller: 'profileCtrl',
                controllerAs: 'profileCtrl',
            })
            .when('/facebook/:token',{
                templateUrl: 'app/views/pages/users/social/social.html',
                controller: 'facebookCtrl',
                controllerAs: 'facebook'
            })

            .when('/facebookerror',{
                templateUrl: 'app/views/pages/users/login.html',
                controller: 'facebookCtrl',
                controllerAs: 'facebook'
            })

            .otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });
