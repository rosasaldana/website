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


	return router;
}