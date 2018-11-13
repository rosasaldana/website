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

        imageFactory.deletePost = function(id) {
            return $http.delete('/profile-api/image/' + id);
        }

        imageFactory.updateLikes = function(id, user) {
            return $http.post('/profile-api/updatelikes/' + user + "/" + id);
        }

        imageFactory.postComment = function(id, user, message) {
            return $http.post('/profile-api/comments/' + user + "/" + id + "/" + message);
        }

        imageFactory.deleteComment = function(postId, commentId) {
            return $http.delete('/profile-api/comments/' + postId + "/" + commentId); 
        }
        return imageFactory;
    });
