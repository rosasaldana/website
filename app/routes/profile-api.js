var	crypto = require('crypto'),
   	multer = require('multer'),
    GridFsStorage = require('multer-gridfs-storage'),
    Grid = require('gridfs-stream'),
    path = require('path'),
    mongoose = require('mongoose'),
    User = require('../models/user'),
    ImagePost = require('../models/imagepost'),
    ObjectId = require('mongodb').ObjectID;

var conn = mongoose.connection;
//Init gridfs
let gfs;

conn.once('open', function() {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

//Create Storage Engine
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  file: function(req, file) {
    return new Promise(function(resolve, reject) {
      crypto.randomBytes(16, function(err, buf) {
        if(err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });
var currentUser;

module.exports = function(router) {

    //Route to get images for a user
	router.get('/getImages/:user', function(req, res) {
		var imageFileIDs = [];
		var imgFiles = [];

		ImagePost.find({username: req.params.user}, function(err, data) {
			if(err) {
				throw err;
			}
			imageFileIDs = [];
			for(post in data) {
				postID = data[post].imgRef.toString();
				imageFileIDs.push(ObjectId(postID));
			}
			gfs.files.find({_id: {$in: imageFileIDs}}).toArray(function(err, files) {
				if(err) {
					console.log(err);
				}

				for(file in files) {
					imgFiles.push(files[file]);
				}
				res.send(imgFiles);
			})
		});
    });

    //Route to retrieve images from storage engine
	router.get('/image/:filename', function(req, res) {
		gfs.files.findOne({filename : req.params.filename}, function(err, file) {
			if(err) {
				console.log(err);
			}
			if(file != null) {
			const readstream = gfs.createReadStream((file.filename));
			readstream.pipe(res);
			}
		});
	})

    //Route to upload image for a given user
	router.post('/userimages', upload.single('userImg'), function(req, res) {
         var imagePost = new ImagePost();
		 imagePost.imgTitle = req.body.imgTitle;
		 imagePost.imgDescription = req.body.imgDescription;
		 imagePost.imgRef = req.file.id;
		 imagePost.username = req.body.username;

		imagePost.save(function(err) {
			if(err) {
				res.json({
					err: 'Error saving photo!'
				});
			}
		});

		res.redirect('/profile');
	});

    //Route to upload a profile picture for a given user
    router.post('/uploadProfilePic', upload.single('profilePic'), function(req, res){
        if(req.file){
            User.findOne({username: req.body.user}, function(err, user){
                if(err) throw err;

                if(user){
                    user.profilePicture = req.file.filename;
                    console.log(req.file);
                    user.save(function(err){
                        if(err){
                            res.json({
                                success: false,
                                message: "Error uploading profile picture"
                            });
                        }
                        else{
                            res.redirect('/profileSettings');
                        }
                    });
                }
                else{
                    res.json({
                        success: false,
                        message: "Unable to find user"
                    });
                }
            });
        }
        else{
            res.redirect('/profileSettings');
        }
    });

    router.get('/getProfilePic/:filename', function(req, res){
        console.log(req.params.filename);
        gfs.files.findOne({filename : req.params.filename}, function(err, file){
            if(err) throw err;

            if(file != null){
                var readstream = gfs.createReadStream((file.filename));
                readstream.pipe(res);
            }
            else{
                res.json({
                    success: false,
                    message: "Unable to find file"
                });
            }
        });
    });

	return router;
}
