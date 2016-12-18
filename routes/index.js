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

//首页
router.get('/', function (req, res, next) {
    var article = [], banner = [], marquee = [], ysjz = [];
    Article.find({'is_top': true})
        .sort({'is_top_create_at': -1})
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
router.get('/article/title/:title', function (req, res, next) {
    var _tit = '';
    if (req.params.title == 'zjdy') _tit = '走进东娱';
    else if (req.params.title == 'ywbk') _tit = '业务板块';
    else _tit = '案例展示';
    Article.findOneAndUpdate({title: _tit, type: 5}, {'$inc': {view: 1}}, function (err, article) {
        if (err) {
            return false;
        }
        res.render('article', {article: article, cur: req.params.title, user: req.session.user});
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
                    _url: '/article/list',
                    cur: 'list'
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
        res.render('admin/editor', {cur: 'article_editor', article: article, user: req.session.user});
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
    res.render('admin/editor', {cur: 'article_editor', article: null, user: req.session.user});
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
    else if (type == 6) _cur = 'article_sjlmy';
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

// 三级栏目归档
router.get('/article/column/column_avg', adminRequired, function (req, res, next) {
    Article.find({"type": {"$in": [5, 6]}})
        .exec(function (err, articles) {
            if (err)return false;
            var main_artivcle = [], sub_article = [];
            articles.map(function (v, i) {
                if (v.type == 5) main_artivcle.push(v);
                if (v.type == 6) sub_article.push(v);
            });
            res.render('admin/column', {
                cur: 'column_avg',
                main_artivcle: main_artivcle,
                sub_article: sub_article,
                _url: '',
                search: null
            });

        });
});
// 三级栏目归档
router.post('/article/column/avg', adminRequired, function (req, res, next) {
    console.log(req.body.node);
    var ep = new eventproxy();
    ep.after('update_column', req.body.node.length, function () {
        res.json({code:1,msg:'aa'});
    });

    req.body.node.map(function (i,v) {
        Article.update({_id:v.parent},{'$set':{'sub_article':v.child}},function (err) {
            if(err) console.log(res);
            else ep.emit('update_column');
        })
    });
});
module.exports = router;
