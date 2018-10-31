var nodemailer = require('nodemailer');


//gmail account used to send messages
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pixmapteam@gmail.com',
        pass: 'randomPassword123!'
    }
});

module.exports = function(router) {

	router.post('/contact', function(req, res) {

		    const mailOptions = {
	            from: req.body.contactEmail, // sender address
	            to: 'pixmapteam@gmail.com', // list of receivers
	            subject: 'Message from ' + req.body.contactEmail, // Subject line
	            html: '<p>'+ req.body.contactMsg + '<br>' + 'Customer Name: ' + req.body.contactName +'</p>'// plain text body
            };

            transporter.sendMail(mailOptions, function (err, info) {
				if(err)
				    console.log(err)
				else
				    console.log(info);
				});
	});

	return router;
}