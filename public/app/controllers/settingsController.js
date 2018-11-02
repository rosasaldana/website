/*
    This file contains the settingsController which is used in the settings.html
*/

angular.module('settingsController', ['userServices'])

    .directive("fileread", [function() {
        return{
            scope: {
                fileread: "="
            },
            link: function(scope, element, attributes){
                element.bind("change", function(changeEvent){
                    console.log('over here');
                    var reader = new FileReader();
                    reader.onload = function(loadEvent) {
                        scope.$apply(function() {
                            scope.fileread = loadEvent.target.result;
                        });
                    }
                    reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        }
    }])

    .controller('settingsController', function(){
        var settings = this;
        settings.profileSettings = true;
        settings.accountSettings = false;
        settings.displayName = "Doug";  //Change this to a query from the database
        settings.displayEmail = "doug@gmail.com"; //Change this to a query from the database

        settings.displayProfile = function(){
            settings.profileSettings = true;
            settings.accountSettings = false;
        }

        settings.displayAccount = function(){
            settings.profileSettings = false;
            settings.accountSettings = true;
        }
    });
