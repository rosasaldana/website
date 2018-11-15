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

        //Location.addLocation() => function call
        locationFactory.addLocation = function(location){
            return $http.post('/location-api/addLocation', location);
        }

        //Location.toAddress() => function call
        locationFactory.convertToAddress = function(coordinate){
            return $http.post('/location-api/getAddress', coordinate);
        }

        //Location.toCoordinate() => function call
        locationFactory.toCoordinate = function(address){
            return $http.post('/location-api/getCoordinates/' + address);
        }

        return locationFactory;
    });
