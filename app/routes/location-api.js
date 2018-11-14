/*
    This file contains the backend routes for location
*/

var Location = require('../models/location');
var mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
var geocodingClient = mbxGeocoding({accessToken: 'pk.eyJ1IjoiZG91Z2FndWVycmEiLCJhIjoiY2puNHpwNGk4MDA3azNrbGttMnlndTd6YSJ9.zPFiViInpT-AH8lhvsOE8A'});


module.exports = function(router){

    //Route to convert coordinates to an address
    router.post('/getAddress', function(req, res){
        if(req.body.longitude && req.body.latitude){
            geocodingClient.reverseGeocode({
                query: [req.body.longitude, req.body.latitude], limit: 1
            }).send().then(function(response){
                var responseBody = JSON.parse(response.rawBody);
                req.body.address = responseBody.features[0].place_name;
                res.json({
                    success: true,
                    address: req.body.address
                });
            });
        } else{
            res.json({
                success: false,
                message: "No coordinate where provided"
            });
        }
    });

    //Middleware route to get the coordinates and locations of a specified place
    router.use('/addLocation', function(req, res, next){
        if(req.body.address){
            geocodingClient.forwardGeocode({
                query: req.body.address, limit: 1
            }).send().then(function(response){
                req.body.longitude = response.body.features[0].center[0];
                req.body.latitude = response.body.features[0].center[1];
                console.log(req.body.longitude, req.body.latitude);
                next();
            });
        } else{
            req.error = "No location was provided";
            next();
        }
    });

    // Adding a location into the database
    // http://<url>/location-api/addLocation
    router.post('/addLocation', function(req, res){
        var newLocation = new Location;

        if(req.error){
            res.json({
                success: false,
                message: 'No location has been provided'
            });
        } else{
            newLocation.address = req.body.address;
            newLocation.longitude = req.body.longitude;
            newLocation.latitude = req.body.latitude;
            newLocation.frequency = 10;

            Location.findOne({longitude: req.body.longitude, latitude: req.body.latitude}, function(err, location){
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
