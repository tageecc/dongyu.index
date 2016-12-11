var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    isadmin: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: new Date()
    }
});
module.exports = mongoose.model('User', UserSchema);