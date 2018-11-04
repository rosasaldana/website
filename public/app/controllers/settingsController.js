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

        settings.display = [true, false];   //[profile page, account page]; used to control what gets displayed on screen
        settings.showAvatar = true;

        $scope.$on('$viewContentLoaded', function(){
            User.getUser().then(function(response){
                settings.username = response.data.username;

                User.getUserInfo(settings.username).then(function(userInfo){
                    settings.displayName = userInfo.data.displayName;
                    settings.displayEmail = userInfo.data.email;
                    if(settings.displayName == null || settings.displayName == ""){
                        settings.displayName = userInfo.data.username;
                    }
                });
                settings.avatarText = settings.username[0].toUpperCase();
                avatarStyle.setAttribute("style", "background-color: " + User.getAvatarColor(settings.avatarText) + ";");
            });
        });

        settings.displayPage = function(page){
            for(index in settings.display){
                settings.display[index] = false;
                if(index == page) settings.display[index] = true;
            }
        }

        $scope.displayPic = function(){
            $scope.$apply(function(){
                settings.showAvatar = false;
            });
            profilePic.src = $scope.previewImage;
        }
    });
