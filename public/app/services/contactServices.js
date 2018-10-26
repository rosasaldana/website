/*
    This file contains functions related to contact requests
    Gets called in contactCtrl.
*/

angular.module('contactServices', [])

    .factory('Messages', function($http){
        var messageFactory = {};

        //Messages.sendMessage() => function call
        messageFactory.sendMessage = function(data){
            return $http.post('/contact-api/contact', data);
        };

        return messageFactory;
    });
