/*
    This file contains the profileController which is used in profile.html
    Also includes the directive needed to render the mapbox onto the page view
    Includes map functionality to add the heat map layer.
*/

angular.module('profileController', ['locationServices'])

    //Directive needed to load mapbox onto the screen
    .directive('mapbox', function() {
        return {
            template: "<div id='map'><div>", //Way to load map in the html file
            link: function(scope, element, attributes) {

                //Obtaining photoLocations from back-end to render on map
                scope.getPhotoLocations();

                //Initial load of the map
                mapboxgl.accessToken = 'pk.eyJ1IjoiZG91Z2FndWVycmEiLCJhIjoiY2puNHpwNGk4MDA3azNrbGttMnlndTd6YSJ9.zPFiViInpT-AH8lhvsOE8A';
                var map = new mapboxgl.Map({
                    container: 'map', // container id
                    style: 'mapbox://styles/mapbox/dark-v9', // stylesheet location
                    zoom: 1 //Zoom all the way out would show the entire map
                });

                //Adding the GeoCoder Api to search within a map
                var geocoder = new MapboxGeocoder({
                    accessToken: mapboxgl.accessToken
                });
                map.addControl(geocoder);


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

                //Updates map location to the user's current location
                scope.updateMapLocation = function(longitude, latitude) {
                    map.jumpTo({
                        center: [longitude, latitude],
                        zoom: 5
                    });
                };
            }
        };
    })

    //profileCtrl called in profile.html
    .controller('profileCtrl', function($scope, Locations) {
        var profile = this;
        profile.showMap = false;
        profile.showProfile = true;

        //Retreiving the photo locations from the server
        //Calling a service from locationServices
        $scope.getPhotoLocations = function(){
            Locations.getLocations().then(function(data) {
                $scope.geojson = data.data;
            });
        }

        //Toggle display between map and profile
        profile.toggleDisplay = function(){
            profile.showMap = !profile.showMap;
            profile.showProfile = !profile.showProfile;

            if(profile.showMap){
                profile.getUserLocation();
            }
        };

        //Requesting user's current location to update map view
        profile.getUserLocation = function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    $scope.updateMapLocation(position.coords.longitude, position.coords.latitude);
                });
            } else {
                console.log('Location Request Denied');
            }
        };
    });
