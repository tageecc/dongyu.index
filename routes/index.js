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
        .sort({'create_at': -1})
        .exec(function (err, articles) {
            if (err) return false;
            if (articles && articles.length > 0) {
                articles.forEach(function (v, i) {
                    if (v.type == 1 && article.length < 6) {
                        article.push(v);
                    }
                    else if (v.type == 2 /*&& ysjz.length < 6*/) {
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
            res.render('index', {article: article, banner: banner, marquee: marquee, ysjz: ysjz});
        });

});

//详情页
router.get('/article/id/:id', function (req, res, next) {
    Article.findOneAndUpdate({_id: req.params.id}, {'$inc': {view: 1}}, function (err, article) {
        if (err) {
            return false;
        }
        res.render('article', {article: article});
    });
});
router.get('/article/title/:title', function (req, res, next) {
    Article.findOneAndUpdate({title: req.params.title,type:5}, {'$inc': {view: 1}}, function (err, article) {
        if (err) {
            return false;
        }
        res.render('article', {article: article});
    });
});
//列表页
router.get('/article/list', function (req, res, next) {
    var perPage = req.query.perPage ? req.query.perPage : 10, curPage = req.query.page ? req.query.page : 1;
    Article.find({})
        .sort({'create_at': -1})
        .skip((curPage - 1) * perPage)
        .limit(perPage)
        .exec(function (err, articles) {
            if (err)return false;

            Article.count({}, function (err, count) {
                var totalPages = Math.ceil(count / perPage);
                res.render('list', {
                    article: articles,
                    perPage: perPage,
                    curPage: curPage,
                    totalPages: totalPages,
                    _url: '/article/list'
                });
            });
        });

});
//登陆页
router.get('/login', function (req, res, next) {
    res.render('login');
});
//登陆
router.post('/login', function (req, res, next) {
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
//编辑文章
router.get('/article/editor/:id', adminRequired, function (req, res, next) {
    Article.findOne({_id: req.params.id}, function (err, article) {
        if (err) return false;
        res.render('admin/editor', {cur: 'article_editor', article: article});
    });
});
//编辑文章
router.post('/article/editor/:id', adminRequired, function (req, res, next) {
    Article.update({_id: req.params.id}, req.body, function (err) {
        if (err) {
            res.json({code: -1, msg: '数据库错误！'});
            return false;
        }
        res.json({code: 1, msg: '更新成功！'})

    });
});
//搜索
router.post('/article/search', adminRequired, function (req, res, next) {
    var perPage = req.query.perPage ? req.query.perPage : 10, curPage = req.query.page ? req.query.page : 1;
    var regex = new RegExp(req.body.key, 'i');
    Article.find({$or: [{title: regex}, {age: regex}]})
        .sort({'create_at': -1})
        .skip((curPage - 1) * perPage)
        .limit(perPage)
        .exec(function (err, articles) {
            if (err)return false;

            Article.count({$or: [{title: regex}]}, function (err, count) {
                var totalPages = Math.ceil(count / perPage);
                res.render('admin/list', {
                    cur: 'article_list',
                    article: articles,
                    perPage: perPage,
                    curPage: curPage,
                    totalPages: totalPages,
                    _url: '/admin/article/list',
                    search: req.body.key
                });
            });
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

//后台编辑页面
router.get('/admin/editor', adminRequired, function (req, res, next) {
    res.render('admin/editor', {cur: 'article_editor', article: null});
});
router.get('/admin', function (req, res, next) {
    res.redirect('/admin/article/list');
});
//后台文章列表
router.get('/admin/article/list', adminRequired, function (req, res, next) {
    var perPage = req.query.perPage ? req.query.perPage : 10,
        curPage = req.query.page ? req.query.page : 1,
        type = req.query.type ? req.query.type : 1;
    var _cur = '';
    if (type == 1) _cur = 'article_xwdt';
    else if (type == 2) _cur = 'article_dyzp';
    else if (type == 3) _cur = 'article_sytt';
    else _cur = 'article_tplb';
    Article.find({type: type})
        .sort({'create_at': -1})
        .skip((curPage - 1) * perPage)
        .limit(perPage)
        .exec(function (err, articles) {
            if (err)return false;

            Article.count({type: type}, function (err, count) {
                var totalPages = Math.ceil(count / perPage);
                res.render('admin/list', {
                    cur: _cur,
                    article: articles,
                    perPage: perPage,
                    curPage: curPage,
                    totalPages: totalPages,
                    _url: '',
                    search: null
                });
            });
        });
});
module.exports = router;
