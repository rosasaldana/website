/*
    This file contains the instantiating of all other angular services and controllers
    Accessed in index.html to set the ng-app
*/

angular.module('PixMapApp',
    ['appRoutes',
    'userController',
    'userServices',
    'mainController',
    'authServices',
    'profileController',
    'aboutController',
    'locationServices',
    'contactController',
    'contactServices',
    'uploadServices',
    'settingsController'])

    .config(function($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptors');
    });
