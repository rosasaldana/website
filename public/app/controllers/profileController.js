/*
    This file contains the profileController which is used in profile.html
    Also includes the directive needed to render the mapbox onto the page view
    Includes map functionality to add the heat map layer.
*/

angular.module('profileController', ['locationServices', 'userServices', 'uploadServices'])

    //Directive needed to load mapbox onto the screen
    .directive('mapbox', function() {
        return {
            template: "<div id='map'><div>", //Way to load map in the html file
            link: function(scope, element, attributes) {
                //Initial load of the map
                mapboxgl.accessToken = 'pk.eyJ1IjoiZG91Z2FndWVycmEiLCJhIjoiY2puNHpwNGk4MDA3azNrbGttMnlndTd6YSJ9.zPFiViInpT-AH8lhvsOE8A';
                var map = new mapboxgl.Map({
                    container: 'map', // container id
                    style: 'mapbox://styles/mapbox/dark-v9', // stylesheet location
                    center: [-50.000, 20],
                    zoom: 1 //Zoom all the way out would show the entire map
                });

                //Adding the GeoCoder Api to search within a map
                var geocoder = new MapboxGeocoder({
                    accessToken: mapboxgl.accessToken
                });
                map.addControl(geocoder);

                //Adding user location to the map
                map.addControl(new mapboxgl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true
                    },
                    fitBoundsOptions: {
                        maxZoom: 7
                    },
                    trackUserLocation: true,
                    showUserLocation: false
                }), 'bottom-right');


                //On loading the map creating a heat-map layer and placing circles
                //on the locations where pictures have been posted
                map.on('load', function() {
                    map.addSource('photoLocation', {
                        "type": "geojson",
                        "data": scope.geojson
                    });
                    map.addLayer({
                        "id": "photoLocation-heat",
                        "type": "heatmap",
                        "source": "photoLocation",
                        "maxzoom": 9,
                        "paint": {
                            // Increase the heatmap weight based on frequency of locations
                            // When frequency: 0 => weight: 0; frequency: 50 => weight: 3
                            "heatmap-weight": [
                                "interpolate",
                                ["linear"],
                                ["get", "frequency"],
                                0, 0,
                                10, 1,
                                100, 2
                            ],
                            // Heatmap-intensity is a multiplier on top of heatmap-weight
                            // When zoom: 0 => weight: 1; zoom: 9 => weight: 3
                            "heatmap-intensity": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                0, 1,
                                9, 3
                            ],
                            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                            // Begin color ramp at 0-stop with a 0-transparancy color
                            // to create a blur-like effect.
                            "heatmap-color": [
                                "interpolate",
                                ["linear"],
                                ["heatmap-density"],
                                0, "rgba(33,102,172,0)",
                                0.2, "rgb(103,169,207)",
                                0.4, "rgb(209,229,240)",
                                0.6, "rgb(253,219,199)",
                                0.8, "rgb(239,138,98)",
                                1, "rgb(178,24,43)"
                            ],
                            // Adjust the heatmap radius by zoom level
                            "heatmap-radius": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                0, 2,
                                9, 20
                            ],
                            // Transition from heatmap to circle layer by zoom level
                            "heatmap-opacity": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                7, 1,
                                9, 0
                            ],
                        }
                    });
                    //Adding circles to the map at the photo-locations, displayed when zooming in
                    map.addLayer({
                        "id": "photoLocation-point",
                        "type": "circle",
                        "source": "photoLocation",
                        "minzoom": 8,
                        "paint": {
                            // Size circle radius by frequency and zoom level
                            "circle-radius": [
                                "interpolate",
                                ["linear"],
                                ["get", "frequency"],
                                8, [
                                    "interpolate",
                                    ["linear"],
                                    ["get", "frequency"],
                                    1, 5,
                                    100, 7
                                ],
                                15, [
                                    "interpolate",
                                    ["linear"],
                                    ["get", "frequency"],
                                    1, 8,
                                    100, 12
                                ]
                            ],
                            // Color circle by earthquake magnitude
                            "circle-color": [
                                "interpolate",
                                ["linear"],
                                ["get", "frequency"],
                                0, "rgba(33,102,172,0)",
                                1, "rgb(103,169,207)",
                                20, "rgb(209,229,240)",
                                40, "rgb(253,219,199)",
                                80, "rgb(239,138,98)",
                                100, "rgb(178,24,43)"
                            ],
                            "circle-stroke-color": "white",
                            "circle-stroke-width": 1,
                            // Transition from heatmap to circle layer by zoom level
                            "circle-opacity": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                7, 0,
                                8, 0.5,
                                9, 1
                            ]
                        }
                    });
                });
            }
        };
    })


    //profileCtrl called in profile.html
    .controller('profileCtrl', function($scope, $window, Locations, User, ImagePosts) {
        var profile = this;
        profile.username = $scope.username;
        profile.userposts = [];
        profile.friends = {
            username: [],
            displayName: []
        };
        var userComment = $scope.userComment;
        $scope.$on('$viewContentLoaded', function() {

            User.getUser().then(function(response) {
                profile.username = response.data.username;

                //Retrieving the current user's friends
                User.getFriends(response.data.username).then(function(response) {
                    var friends = response.data[0].following.users;

                    //Retrieving display name for all friends and removing friend if they
                    //no longer exist in the database
                    for(index in friends){
                        User.getDisplayName(friends[index]).then(function(res){
                            if(res.data.success){
                                profile.friends.displayName.push(res.data.displayName);
                                profile.friends.username.push(res.data.username);
                            } else{
                                var removeFriend = {
                                    username: profile.username,
                                    followingUser: res.data.username
                                }
                                User.removeFriend(removeFriend);
                            }
                        });
                    }
                });

                //Retrieving all users
                User.getAllUsers(profile.username).then(function(response) {
                    profile.users = response.data;
                });

                //Retrieve current user image posts
                ImagePosts.getPhotos(profile.username).then(function(response) {
                    profile.userposts = response.data;
                });
            });

            //Retreiving the photo locations from the server
            //Calling a service from locationServices
            Locations.getLocations().then(function(data) {
                $scope.geojson = data.data;
            });
        });

        //Adding a friend for current user
        profile.followUser = function(user) {
            var username = profile.users.username[profile.users.displayName.indexOf(user)];
            var followUserRequest = {
                username: profile.username,
                followingUser: username
            };

            User.addFriend(followUserRequest).then(function(response) {
                if (response.data.success == true) {
                    profile.friends.displayName.push(user);
                    profile.friends.username.push(username);
                } else {
                    profile.errorMsg = response.data.message;
                }
            });
        };

        //Unfollowing a friend from the friends list
        profile.unfollowUser = function(user) {
            var username = profile.users.username[profile.users.displayName.indexOf(user)];
            var unfollowUserRequest = {
                username: profile.username,
                followingUser: username
            };

            User.removeFriend(unfollowUserRequest).then(function(response) {
                if (response.data.success == true) {
                    var index = profile.friends.displayName.indexOf(user);
                    profile.friends.displayName.splice(index, 1);
                    profile.friends.username.splice(index, 1);
                }
            });
        };

        //Function to check if the user follows someone to dynamically update add friend list
        profile.followsUser = function(user) {
            if (profile.friends.displayName.indexOf(user) != -1) {
                return true;
            } else {
                return false;
            }
        }

        profile.deleteImagePost = function(postId) {
            ImagePosts.deletePost(postId).then(function() {
                $window.location.href = '/profile';
            });

        }

        profile.updateLikes = function(postId, username) {

            ImagePosts.updateLikes(postId, profile.username).then(function(response) {
               for(post in profile.userposts) {
                    if(profile.userposts[post]._id == postId) {
                        profile.userposts[post].likeCount = response.data.updatedLikes;
                        profile.userposts[post].heartstatus = response.data.heartstatus;
                    }
               }
            });
        }

        $scope.postComment = function(postId, username, message) {
            ImagePosts.postComment(postId, profile.username, message).then(function(response) {
                for(post in profile.userposts) {
                    if(profile.userposts[post]._id == postId) {
                     profile.userposts[post].comments = response.data.comments;
                    }
                }
                $scope.profileCtrl.userComment ="";
                return false;
            });
        }

        profile.deleteComment = function(postId, commentId) {
            ImagePosts.deleteComment(postId, commentId).then(function(response) {
                // for(post in profile.userposts){
                //     if(profile.userposts[post]._id == postId) {
                //         for(comment in profile.userposts[post].comments) {
                //             if(profile.userposts[post].comments[comment]._id == commentId) {
                //                 var index = profile.userposts[post].comments.indexOf(comment);
                //                 profile.userposts[post].comments.splice(index, 1);
                //             }
                //         }
                //     }
                // }console.log(response.data.comments);
            });
        }
    });
