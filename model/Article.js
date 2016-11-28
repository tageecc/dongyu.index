var mongoose = require('mongoose');
var ArticleSchema = new mongoose.Schema({
    title: String,
    content: String,
    type:Number,// 1 新闻， 2 banner， 3 图片轮播
    headimg:String,// 图片
    date: {
        type: Date,
        default: new Date().toLocaleString().replace(/(\d{4}).(\d{1,2}).(\d{1,2})/mg, "$1-$2-$3")
    }
});
module.exports = mongoose.model('Article', ArticleSchema);