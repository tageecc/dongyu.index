var mongoose = require('mongoose');
var ArticleSchema = new mongoose.Schema({
    title: String,
    content: String,
    type: Number,// 1 新闻动态 ,2 东娱作品 ,3 banner, 4 图片轮播, 5 二级栏目
    headimg: String,// 图片
    video:String,
    view: {
        type: Number,
        default: 0
    },
    date: {
        type: String,
        default: new Date().toLocaleString().replace(/(\d{4}).(\d{1,2}).(\d{1,2})/mg, "$1-$2-$3").substr(0, 10)
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('Article', ArticleSchema);