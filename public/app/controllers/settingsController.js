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

    .controller('settingsController', function($scope, $window, User){
        var settings = this;
        var profilePic = document.getElementById('previewProfilePic');
        var avatarStyle = document.getElementById('avatar');
        var form = document.getElementById('submission-form');
        settings.previewPic = false;

        //Array to control which is image is displayed
        // [ profile picture, avatar image, preview picture ]
        settings.imageDisplay = [false, false, false];

        // On the page load we obtain the all the information for the current user
        // Then we display the avatar or the profile picture, and the e-mail and display name
        $scope.$on('$viewContentLoaded', function(){
            User.getUser().then(function(response){
                settings.username = response.data.username;

                User.getUserInfo(settings.username).then(function(userInfo){
                    settings.displayName = userInfo.data.displayName;
                    settings.displayEmail = userInfo.data.email;
                    settings.profilePicture = userInfo.data.profilePicture;

                    if(settings.displayName == null || settings.displayName == ""){
                        settings.displayName = settings.username;
                    }
                    settings.avatarText = settings.displayName[0].toUpperCase();
                    avatarStyle.setAttribute("style", "background-color: " + User.getAvatarColor(settings.avatarText) + ";");

                    if(settings.profilePicture == null || settings.profilePicture == ""){
                        settings.togglePictureDisplay(1);
                    } else{
                        settings.togglePictureDisplay(0);
                    }
                });
            });
        });

        //Toggling image display between avatar, profile picture and preview of uploaded image
        settings.togglePictureDisplay = function(picture){
            for(index in settings.imageDisplay){
                settings.imageDisplay[index] = false;
                if(index == picture) settings.imageDisplay[index] = true;
            }
        }

        //Function to cancel the photo upload, and reverting back to the profile picture
        settings.cancelPicUpdate = function(){
            if(settings.profilePicture) settings.togglePictureDisplay(0);
            else settings.togglePictureDisplay(1);
            settings.previewPic = false;
            form.reset();
        }

        //Function to update display name and e-mail
        settings.updateProfileInfo = function(profileData){
            settings.updateError = settings.updateSuccess = false;
            if(profileData){
                profileData.username = settings.username;
                User.updateProfile(profileData).then(function(response){
                    settings.updateMsg = response.data.message;
                    if(response.data.success){
                        settings.displayName = (profileData.displayName) ? profileData.displayName : settings.displayName;
                        settings.displayEmail = (profileData.email) ? profileData.email : settings.displayEmail;
                        settings.updateSuccess = true;
                    }
                    else{
                        settings.updateError = true;
                    }
                });
            }
        }

        //Function to display preview picture when user uploads
        $scope.displayPic = function(){
            profilePic.src = $scope.previewImage;
            $scope.$apply(function(){
                settings.togglePictureDisplay(2);
                settings.previewPic = true;
            });
        }

        //Function to update the password
        settings.updatePassword = function(passwordData){
            settings.passwordError = settings.passwordSuccess = false;
            if(!passwordData) return;
            else if(passwordData.newPassword != passwordData.confirmPassword){
                settings.passwordMsg = "Passwords do not match";
                settings.passwordError = true;
                return;
            }
            else{
                passwordData.username = settings.username;
                User.updatePassword(passwordData).then(function(response){
                    settings.passwordMsg = response.data.message;
                    if(response.data.success){
                        settings.passwordSuccess = true;
                    } else{
                        settings.passwordError = true;
                    }
                });
            }
        }

        //Function to delete the account
        settings.deleteAccount = function(deleteData){
            settings.deleteError = false;

            if(deleteData){
                deleteData.username = settings.username;
                User.deleteAccount(deleteData).then(function(response){
                    if(response.data.success){
                        User.logout();
                        $window.location.href = '/home';
                    } else{
                        settings.deleteError = true;
                        settings.deleteErrorMsg = response.data.message;
                    }
                });
            }
        }

    });
