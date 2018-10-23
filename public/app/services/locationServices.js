/*
    This file contains functions related to location requests
    Gets called in profileCtrl.
*/

angular.module('locationServices', [])

    .factory('Locations', function($http){
        var locationFactory = {};

        //Location.getLocations() => function call
        locationFactory.getLocations = function(){
            return $http.get('/location-api/getLocations');
        };

        return locationFactory;
    });
