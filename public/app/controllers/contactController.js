angular.module('contactController', ['contactServices'])


    //contactCtrl called in about.html
    .controller('contactCtrl', function($http, $location, $timeout, Messages){
        var app=this;


        app.sendMail = function() {

            //data to pass to sendMessage
            var data  =  ({
                contactName: this.contactName,
                contactEmail: this.contactEmail,
                contactMsg: this.contactMsg
            });
           
            Messages.sendMessage(data);

            //reset form on click
            var form = document.getElementById("contactMsgForm");
            form.reset();

        }

    });
