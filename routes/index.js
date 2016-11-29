var express = require('express');
var router = express.Router();
var Article = require('../model/Article');
var User = require('../model/User');

var adminRequired = function (req, res, next) {
    var user = req.session.user;
    if (!user) {
        res.render('login');
        return false;
    }
    next()
};

//首页
router.get('/', function (req, res, next) {
    var article = [], banner = [], marquee = [], ysjz = [];
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
            res.render('index', {article: article, banner: banner, marquee: marquee, ysjz: ysjz});
        });

});

//详情页
router.get('/article/:id', function (req, res, next) {
    console.log(req.params.id);
    Article.findOneAndUpdate({_id: req.params.id}, {'$inc': {view: 1}}, function (err, article) {
        if (err) {
            return false;
        }
        res.render('article', {article: article});
    });
});
//登陆页
router.get('/login', function (req, res, next) {
    res.render('login');
});
//登陆
router.post('/login', function (req, res, next) {
    console.log(req.body.username,req.body.password);
    if (req.body.username == '' || req.body.password == '') {
        res.render('error', {message: '用户名或密码错误，请重试！'});
        return false;
    }
    User.findOne({username: req.body.username, password: req.body.password}, '-password', function (err, user) {
        if (err) {
            res.render('error', {message: '网络错误，请重试！'});
            return false;
        }
        if (user) {
            req.session.user = user;
            res.redirect('/admin/article/list');
            return false;
        }
        res.render('error', {message: '用户名或密码错误，请重试！'});

    });

});
//添加文章
router.post('/article/add', adminRequired, function (req, res, next) {
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
router.post('/article/remove/:id', adminRequired, function (req, res, next) {
    Article.remove({_id: req.params.id}, function (err) {
        if (err) {
            res.json({code: -1, msg: '删除失败！'});
            return false;
        }
        res.json({code: 1, msg: '删除成功！'});
    })
});

//后台编辑
router.get('/admin/editor', adminRequired, function (req, res, next) {
    res.render('admin/editor', {cur: 'editor'});
});
//后台文章列表
router.get('/admin/article/list', adminRequired, function (req, res, next) {
    Article.find({})
        .sort({'date': -1})
        .exec(function (err, articles) {
            if (err)return false;
            res.render('admin/list', {cur: 'article_list', article: articles});

        });
});
module.exports = router;
