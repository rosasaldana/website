/*
    This file contains the profileController which is used in profile.html
    Also includes the directive needed to render the mapbox onto the page view
*/

angular.module('profileController', [])

    //Directive needed to load mapbox onto the screen
    .directive('mapbox', function() {
        return {
            template: "<div id='map'><div>",
            link: function(scope, element, attributes) {
                mapboxgl.accessToken = 'pk.eyJ1IjoiZG91Z2FndWVycmEiLCJhIjoiY2puNHpwNGk4MDA3azNrbGttMnlndTd6YSJ9.zPFiViInpT-AH8lhvsOE8A';
                var map = new mapboxgl.Map({
                    container: 'map', // container id
                    style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
                    center: [-74.50, 40], // starting position [lng, lat]
                    zoom: 9 // starting zoom
                });
            }
        };
    })

    //profileCtrl called in profile.html
    .controller('profileCtrl', function(){
        var app=this;
        app.showMap = false;
        app.showProfile = true;

        app.displayMap = function(){
            console.log('map');
            app.showMap = true;
            app.showProfile = false;
        }

        app.displayProfile = function(){
            console.log('profile');
            app.showMap = false;
            app.showProfile = true;
        }
    });
