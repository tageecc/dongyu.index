var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ArticleSchema = new mongoose.Schema({
    title: String,
    content: String,
    type: Number,// 1 新闻动态 ,2 东娱作品 ,3 banner, 4 图片轮播, 5 二级栏目, 6 sub_article, 7 文章列表
    column_type: Number,//栏目类别
    sub_article: [{type: Schema.Types.ObjectId, ref: 'Article'}],
    headimg: String,// 图片
    video: String,// 视频标签
    description: String,
    order: { //排序
        type: Number,
        default: 0
    },
    is_top: {
        type: Boolean,
        default: false
    },
    is_top_create_at: {
        type: Date,
        default: Date.now
    },
    view: {
        type: Number,
        default: 0
    },
    date: {
        type: String,
        default: new Date().toLocaleString().split(' ')[0]
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('Article', ArticleSchema);