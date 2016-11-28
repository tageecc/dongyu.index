var express = require('express');
var router = express.Router();
var Article = require('../model/Article');

//首页
router.get('/', function (req, res, next) {
    var article = [], banner = [], marquee = [],ysjz=[];
    Article.find({})
        .sort({'type': -1, 'date': 1})
        .exec(function (err, articles) {
            if (err) {
                console.log(err);
                return false;
            }
            if (articles && articles.length > 0) {
                articles.forEach(function (v, i) {
                    if (v.type == 1 && article.length < 6) {
                        article.push(v);
                    }
                    else if (v.type == 2 && banner.length < 6) {
                        ysjz.push(v);
                    }
                    else if (v.type == 3 && banner.length < 6) {
                        banner.push(v);
                    }
                    else if (v.type == 4 && marquee.length < 6) {
                        marquee.push(v);
                    }
                })
            }
            console.log(banner);
            res.render('index', {article: article, banner: banner, marquee: marquee,ysjz:ysjz});
        });

});

//详情页
router.get('/article/:id', function (req, res, next) {
    console.log(req.params.id);
    Article.findOneAndUpdate({_id:req.params.id},{'$inc':{view:1}},function (err, article) {
        if(err){
            return false;
        }
        res.render('article', {article:article});
    });
});

//添加文章
router.post('/article/add', function (req, res, next) {
    if (req.body.title == '' || req.body.content == '') {
        res.json({code: -1, msg: '参数错误！'});
        return false;
    }
    Article.create(req.body, function (err) {
        if (err) {
            res.json({code: -1, msg: '数据库错误！'});
            return false;
        }
        res.json({code: 1, msg: '添加成功！'})

    });
});

//后台编辑
router.get('/admin/editor', function (req, res, next) {
    res.render('admin/editor', {});
});

module.exports = router;
