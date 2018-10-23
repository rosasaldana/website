angular.module('contactFormController', ['$scope' , '$http'])


    //contactFormCtrl called in contact.html
    .controller('contactFormCtrl', function($scope, $http){
        var app=this;

        var data = ({
        	contactName : this.contactName,
        	contactEmail : this.contactEmail,
        	contactMsg : this.contactMsg
        });

        app.sendMail() = function(){
        	$http.post('/contact', data).
        		success(function(data, status, headers, config) {

        		}).
        		error(function(data, status, headers, config) {

        		});
        }
    });
