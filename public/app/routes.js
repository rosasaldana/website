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
                controllerAs: 'userCtrl',
                authenticated: false
            })
            .when('/login', {
                templateUrl: 'app/views/pages/users/login.html',
                controller: 'userCtrl',
                controllerAs: 'userCtrl',
                authenticated: false
            })
            .when('/logout', {
                templateUrl: 'app/views/pages/users/logout.html',
                authenticated: true
            })
            .when('/profile', {
                templateUrl: 'app/views/pages/users/profile.html',
                controller: 'profileCtrl',
                controllerAs: 'profileCtrl',
                authenticated: true
            })
            .when('/profileSettings', {
                templateUrl: 'app/views/pages/users/settings.html',
                controller: 'settingsController',
                controllerAs: 'settingsCtrl',
                authenticated: true
            })
            .when('/activate/:token', {
                templateUrl: 'app/views/pages/users/activate.html',
                controller: 'emailController',
                controllerAs: 'emailCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });

//Preventing user from accessing the profile pages when they are not logged in
//Preventing user from accessing login/register pages when they are logged in
app.run(['$rootScope', '$window', 'User', function($rootScope, $window, User){
    $rootScope.$on('$routeChangeStart', function(event, next, current){
        if(next.$$route != undefined){
            if(next.$$route.authenticated == true){
                if(!User.isLoggedIn()){
                    event.preventDefault();
                    $window.location.href = '/home';
                }
            } else if(next.$$route.authenticated == false){
                if(User.isLoggedIn()){
                    event.preventDefault();
                    $window.location.href = '/profile';
                }
            }
        }
    });
}]);
