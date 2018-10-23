/*
    This file contains the backend routes for location
*/

var Location = require('../models/location');
var mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
var geocodingClient = mbxGeocoding({accessToken: 'pk.eyJ1IjoiZG91Z2FndWVycmEiLCJhIjoiY2puNHpwNGk4MDA3azNrbGttMnlndTd6YSJ9.zPFiViInpT-AH8lhvsOE8A'});

module.exports = function(router){

    // Middleware to convert location to coordinates before storing in database
    // Taking advantage of mapbox api
    router.use('/addLocation', function(req, res, next){
        req.coordinate = null;
        if(req.body.address){
            var queryData = req.body.address;
            geocodingClient.forwardGeocode({
                query: queryData,
                limit: 1
            }).send().then(function(response){
                req.coordinate = response.body.features[0].center;
                console.log(req.coordinate);
                next();
            });
        }
        else{
            next();
        }
    });

    // Adding a location into the database
    // http://<url>/location-api/addLocation
    router.post('/addLocation', function(req, res){
        var newLocation = new Location;

        if(req.coordinate == null){
            res.json({
                success: false,
                message: 'Ensure address is specified'
            });
        }
        else{
            newLocation.address = req.body.address;
            newLocation.longitude = req.coordinate[0];
            newLocation.latitude = req.coordinate[1];
            newLocation.frequency = 1;

            Location.findOne({address: req.body.address}, function(err, location){
                if(err) throw err;

                if(location){
                    location.frequency = location.frequency + 1;
                }
                else{
                    location = newLocation;
                }

                location.save(function(err){
                    if(err){
                        res.json({
                            success: false,
                            message: 'Could not save location in database'
                        });
                    }
                    else{
                        res.json({
                            success: true,
                            message: 'Successfully saved location in database'
                        });
                    }
                });
            });
        }
    });

    // Retrieving locations from database and returning a geoJson
    // http://<url>location-api/getLocations
    router.get('/getLocations', function(req, res){
        var geojson = {
            type: "FeatureCollection",
            features: []
        };

        Location.find(function(err, locations){
            if (err) throw err;

            for(index in locations){
                geojson.features.push({
                    "type": "Feature",
                    "properties" : {
                        "name": locations[index].address,
                        "frequency": locations[index].frequency
                    },
                    "geometry" : {
                        "type": "Point",
                        "coordinates": [locations[index].longitude, locations[index].latitude]
                    }
                });
            }
            res.send(geojson);
        });
    });

    return router;
}
