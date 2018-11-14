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
		var imageposts = [];
        var imgIDs = [];
		var imgFiles = [];

		ImagePost.find({username: req.params.user}, function(err, data) {
			if(err) {
				throw err;
			}
			for(post in data) {
				postID = data[post].imgRef.toString();
				imgIDs.push(ObjectId(postID));
                imageposts.push(data[post].toObject());
			}
			gfs.files.find({_id: {$in: imgIDs}}).toArray(function(err, files) {
				if(err) {
					console.log(err);
				}

				for(file in files) {
                    imageposts.forEach(post => {
                        if(post.imgRef.toString() == files[file]._id) {
                            post.filename = files[file].filename;
                        }
                    });
				}

				res.send(imageposts);
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
			} else {
                res.json({
                    success: false,
                    message: "File not found"
                });
            }
		});
	});

    //Router to delete a user post
    router.delete('/image/:id', function(req, res) {
        var gfsImg = "";
        ImagePost.findByIdAndDelete(req.params.id, function(err, deletedPost) {
            if(err) {
                throw err;
            }
            gfsImg = deletedPost.imgRef[0];
            gfs.remove({_id : gfsImg, root: 'uploads'}, function(err, file) {
                if(err) {
                   throw err;
                }
            });
            res.send(deletedPost);
        });
    });


    //Route to upload image for a given user
	router.post('/userimages', upload.single('userImg'), function(req, res) {
         var imagePost = new ImagePost();
		 imagePost.imgTitle = req.body.imgTitle;
		 imagePost.imgDescription = req.body.imgDescription;
		 imagePost.imgRef = req.file.id;
		 imagePost.username = req.body.username;
         imagePost.likeCount = 0;
         imagePost.heartstatus = "-o";

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

    //Route to update likes on photo
    router.post('/updatelikes/:username/:id', function(req, res) {
        ImagePost.findOne({_id : req.params.id}, function(err, post) {
            if(err) {
                throw err;
                console.log(err);
            }
            var usersLiked = post.likes;
            if(usersLiked.includes(req.params.username)) {
                ImagePost.findOneAndUpdate({_id : req.params.id},
                    {
                        "$inc" : {"likeCount": -1},
                        "$pull" : {"likes" : req.params.username},
                        "heartstatus" : "-o"
                    }, {new:true}, function(err, raw) {
                        if(err) {
                            throw err;
                        }
                        res.json({
                            message: "success",
                            updatedLikes: raw.likeCount,
                            "heartstatus" : "-o"
                        });
                    });
            }
            else {
                ImagePost.findOneAndUpdate({_id : req.params.id},
                    {
                        "$inc" : {"likeCount": 1},
                        "$push" : {"likes" : req.params.username},
                        "heartstatus" : ""
                    }, {new:true}, function(err, raw) {
                        if(err) {
                            throw err;
                        }
                        res.json({
                            message: "success",
                            updatedLikes: raw.likeCount,
                            "heartstatus" : ""
                        });
                    });
            }
        });
    });

    //Router to post a comment
    router.post('/comments/:user/:id/:message', function(req,res) {
        ImagePost.findOneAndUpdate({_id: req.params.id},
            {
                "$push" : {"comments" : {"user" : req.params.user, "message": req.params.message}}
            }, {new: true}, function(err, post) {
                if(err) {
                    throw err;
                }
                res.json(post);
            });
    });

    router.delete('/comments/:postId/:commentId', function(req, res) {
        ImagePost.findOneAndUpdate({_id : new ObjectId(req.params.postId), "comments._id" : new ObjectId(req.params.commentId)},
            {
                "$pull" : {"comments" : {"$elemMatch" : {"_id" : new ObjectId(req.params.commentId)} } }
            }, function(err, post) {
                if(err) {
                    throw err;
                }
                res.json(post);
            });
    });

	return router;
}
