var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  email: { type: String, required: true, unique: true }
});

//Pre-save function to hash user password
UserSchema.pre('save', function(next){
  var user = this;
  bcrypt.hash(user.password, null, null, function(err, hash){
    if(err) return next(err);
    user.password = hash;
    next();
  });
});

module.exports = mongoose.model('User', UserSchema);
