var express = require('express');
var router = express.Router();
var eventproxy = require('eventproxy');
var Article = require('../model/Article');
var User = require('../model/User');

var adminRequired = function (req, res, next) {
    var user = req.session.user;
    if (!user) {
        res.render('login', {cur: 'index'});
        return false;
    }
    next()
};

//首页栏目名
var colunm_name = [['gsjj', 'zzjg', 'gsry', 'gsys'], ['gsxw'], ['yszp', 'yrdy', 'ychhd'], ['mxjj', 'bqhz', 'ggdl', 'ggzr'], ['lxfs', 'rczp', 'xmtg']];
var colunm_name_zh = [['公司简介', '组织架构', '公司荣誉', '公司优势'], ['公司新闻'], ['影视作品', '艺人代言', '演唱会、活动'], ['明星经纪', '版权合作', '广告代理', '广告植入'], ['联系方式', '人才招聘', '项目投稿']];

//首页
router.get('/', function (req, res, next) {
    var article = [], banner = [], marquee = [], ysjz = [];
    Article.find({'is_top': true})
        .populate('sub_article')
        .sort({'is_top_create_at': -1, 'order': 1})
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

            Article.find({'is_top': false})
                .sort({'create_at': -1})
                .populate('sub_article')
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
                    res.render('index', {article: article, banner: banner, marquee: marquee, ysjz: ysjz, cur: 'index'});
                });
        });

});

//详情页
router.get('/article/id/:id', function (req, res, next) {
    Article.findOneAndUpdate({_id: req.params.id}, {'$inc': {view: 1}}, function (err, article) {
        if (err) {
            return false;
        }
        res.render('article', {article: article, cur: 'index'});
    });
});
//栏目
router.get('/article/column/:id', function (req, res, next) {
    var type1 = parseInt(req.params.id / 10), type2 = req.params.id % 10;
    type2 = type2 == 0 ? 1 : type2;
    var type_tit =
        type1 == 1 ? '走进东娱' :
            type1 == 2 ? '东娱新闻' :
                type1 == 3 ? '案例展示' :
                    type1 == 4 ? '业务板块' :
                        type1 == 5 ? '联系我们' : '';
    Article.find({column_type: '' + type1 + type2,'is_top': true})
        .sort({'is_top_create_at': -1, 'create_at': -1})
        .exec(function (err, articles) {
            if (err) {
                return false;
            }
            Article.find({column_type: '' + type1 + type2,'is_top': false})
                .sort({'is_top_create_at': -1, 'create_at': -1})
                .exec(function (err, article) {
                    if (err) {
                        return false;
                    }
                    articles=articles.concat(article);
                    res.render('article2', {
                        article: articles,
                        type1: type1,
                        type2: type2,
                        type_tit: type_tit,
                        column_list: colunm_name_zh[type1 - 1],
                        user: req.session.user
                    });
                });
        });
});
//列表页
router.get('/article/list', function (req, res, next) {
    var perPage = req.query.perPage ? req.query.perPage : 10, curPage = req.query.page ? req.query.page : 1;
    Article.find({type: 1, 'is_top': true})
        .sort({'is_top_create_at': -1, 'create_at': -1})
        .skip((curPage - 1) * perPage)
        .limit(perPage)
        .exec(function (err, articles) {
            if (err)return false;

            Article.find({type: 1, 'is_top': false})
                .sort({'is_top_create_at': -1, 'create_at': -1})
                .skip((curPage - 1) * perPage)
                .limit(perPage)
                .exec(function (err, article) {
                    if (err)return false;
                    articles = articles.concat(article);
                    Article.count({type: 1}, function (err, count) {
                        var totalPages = Math.ceil(count / perPage);
                        res.render('list', {
                            article: articles,
                            perPage: perPage,
                            curPage: curPage,
                            totalPages: totalPages,
                            _url: '/article/list',
                            cur: 'list'
                        });
                    });
                });
        });
});
//登陆页
router.get('/login', function (req, res, next) {
    res.render('login', {cur: 'index'});
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
            res.redirect('/admin/article/column');
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
    if (req.body.is_top) {
        req.body.is_top_create_at = Date.now();
    } else {
        req.body.is_top_create_at = 0;
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
        res.render('admin/editor', {type: 'article_editor', article: article, user: req.session.user});
    });
});
router.get('/article/editor/title/:title', adminRequired, function (req, res, next) {
    var _tit = '';
    if (req.params.title == 'column_zjdy') _tit = '走进东娱';
    else if (req.params.title == 'column_ywbk') _tit = '业务板块';
    else if (req.params.title == 'column_lxwm') _tit = '联系我们';
    else _tit = '案例展示';
    Article.findOne({title: _tit, type: 5}, function (err, article) {
        if (err) return false;
        res.render('admin/editor', {cur: req.params.title, article: article, user: req.session.user});
    });
});
//编辑文章
router.post('/article/editor/:id', adminRequired, function (req, res, next) {
    if (req.body.is_top) {
        req.body.is_top_create_at = Date.now();
    } else {
        req.body.is_top_create_at = 0;
    }
    Article.update({_id: req.params.id}, req.body, function (err) {
        if (err) {
            console.log(err);
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
                    type: 'article_list',
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

//后台列表
router.get('/admin/article/column', adminRequired, function (req, res, next) {
    req.query.type = req.query.type ? req.query.type : 11;
    var type1 = parseInt(req.query.type / 10), type2 = req.query.type % 10;
    type2 = type2 == 0 ? 1 : type2;
    var perPage = req.query.perPage ? req.query.perPage : 10, curPage = req.query.page ? req.query.page : 1;
    Article.find({column_type: '' + type1 + type2})
        .sort({'is_top_create_at': -1, 'create_at': -1})
        .skip((curPage - 1) * perPage)
        .limit(perPage)
        .exec(function (err, articles) {
            if (err)return false;

            Article.count({column_type: '' + type1 + type2}, function (err, count) {
                var totalPages = Math.ceil(count / perPage);
                res.render('admin/list', {
                    article: articles,
                    perPage: perPage,
                    curPage: curPage,
                    totalPages: totalPages,
                    type: '' + type1 + type2,
                    search: null,
                    _url: ''
                });
            });
        });
});


//后台编辑页面
router.get('/admin/editor', adminRequired, function (req, res, next) {
    res.render('admin/editor', {type: 'article_editor', article: null, user: req.session.user});
});
router.get('/admin', function (req, res, next) {
    res.redirect('/admin/article/column');
});
module.exports = router;
