var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
    username:String,
    password:String,
    date: {
        type: Date,
        default: new Date().toLocaleString().replace(/(\d{4}).(\d{1,2}).(\d{1,2})/mg, "$1-$2-$3")
    }
});
module.exports = mongoose.model('User', UserSchema);