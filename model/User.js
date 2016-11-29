var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
    username:String,
    password:String,
    date: {
        type: Date,
        default: new Date()
    }
});
module.exports = mongoose.model('User', UserSchema);