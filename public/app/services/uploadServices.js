/*
    This file contains functions related to upload requests
    Gets called in profileCtrl.
*/

angular.module('uploadServices', [])

    .factory('ImagePosts', function($http){
        var imageFactory = {};

        //Messages.sendMessage() => function call
        imageFactory.getPhotos = function(user) {
            return $http.get('/profile-api/getImages/' + user);
        };

        return imageFactory;
    });
