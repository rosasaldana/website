/*
    This file contains the settingsController which is used in the settings.html
*/

angular.module('settingsController', ['userServices'])

    .directive("imageread", [function() {
        return{
            link: function(scope, element, attributes){
                element.bind("change", function(changeEvent){
                    scope.image = element[0].files[0];
                    var reader = new FileReader();
                    reader.onload = function(loadEvent) {
                        scope.previewImage = reader.result;
                        scope.displayPic();
                    }
                    reader.readAsDataURL(scope.image);
                });
            }
        }
    }])

    .controller('settingsController', function($scope, User){
        var settings = this;
        var profilePic = document.getElementById('previewProfilePic');
        var avatarStyle = document.getElementById('avatar');

        //Array to control which page is being displayed
        // [ profile settings page, account setting page]
        settings.displayPage = [true, false];

        //Array to control which is image is displayed
        // [ profile picture, avatar image, preview picture ]
        settings.imageDisplay = [false, false, false];

        $scope.$on('$viewContentLoaded', function(){
            User.getUser().then(function(response){
                settings.username = response.data.username;

                User.getUserInfo(settings.username).then(function(userInfo){
                    settings.displayName = userInfo.data.displayName;
                    settings.displayEmail = userInfo.data.email;
                    settings.profilePicture = userInfo.data.profilePicture;
                    if(settings.displayName == null || settings.displayName == ""){
                        settings.displayName = userInfo.data.username;
                    }

                    if(settings.profilePicture == null || settings.profilePicture == ""){
                        settings.avatarText = settings.username[0].toUpperCase();
                        avatarStyle.setAttribute("style", "background-color: " + User.getAvatarColor(settings.avatarText) + ";");
                        settings.togglePictureDisplay(1);
                    } else{
                        settings.togglePictureDisplay(0);
                    }
                });
            });
        });

        settings.togglePictureDisplay = function(picture){
            for(index in settings.imageDisplay){
                settings.imageDisplay[index] = false;
                if(index == picture) settings.imageDisplay[index] = true;
            }
        }

        settings.togglePageDisplay = function(page){
            for(index in settings.display){
                settings.display[index] = false;
                if(index == page) settings.display[index] = true;
            }
        }

        settings.updateProfile = function(profileData){
            console.log(profileData);
            asdfa
        }

        $scope.displayPic = function(){
            $scope.$apply(function(){
                settings.togglePictureDisplay(2);
            });
            profilePic.src = $scope.previewImage;
        }
    });
