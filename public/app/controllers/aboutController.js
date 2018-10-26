angular.module('aboutController', [])


    //aboutCtrl called in about.html
    .controller('aboutCtrl', function(){
        var app=this;

        app.scrollDown = function(){
           	$('html,body').animate({
			scrollTop: $("#about-team").offset().top -65
			}, 'slow');
        }
    });
