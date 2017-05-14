//引入gulp及组件
var gulp = require('gulp'),
    sass = require('gulp-sass'), // sass编译
    rename = require('gulp-rename'),  //重命名
    imagemin = require('gulp-imagemin'),  //图片压缩
    pngquant = require('imagemin-pngquant'), //深度压缩png图片
    imageminJpegoptim = require('imagemin-jpegoptim'), //深度压缩jpg图片
    nano = require('gulp-cssnano'),    //css压缩
    uglify = require('gulp-uglify'),           //js压缩
    sprite2 = require('gulp-sprite2'),   //合并图片1
    spritesmith = require('gulp.spritesmith'),  //合并图片2
    makeUrlVer = require('gulp-make-css-url-version'),  //图片添加版本号
    concat = require('gulp-concat'),     //合并文件;
    replace = require('gulp-replace');

//spriterem合并图片
gulp.task('imagemix', function () {
    gulp.src('./public/dev/images/*/**')
        .pipe(spritesmith({
            //间距
            padding: 4,
            //输出合并后图片的地址（相对于输出路径）
            imgName: 'sprite.png',
            //输出样式的地址（相对于输出路径）
            cssName: 'sprite.css',
            //样式格式
            cssFormat: 'css',
            //模板文件（相对于gulpfile的位置）
            cssTemplate: function (data) {
                var arr=[];
                data.sprites.forEach(function (sprite) {
                    arr.push(".icon-"+sprite.name+
                        "{" +
                        "background-image: url(‘"+sprite.escaped_image+"‘);"+
                        "background-position: "+sprite.px.offset_x+"px "+sprite.px.offset_y+"px;"+
                        "width:"+sprite.px.width+";"+
                        "height:"+sprite.px.height+";"+
                        "}\n");
                });
                return arr.join("");
            }
        }))
        .pipe(gulp.dest('./public/release/'));
});

//scss解析
gulp.task('scss', function () {
    gulp.src('./public/dev/css/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./public/release/css'));
});
gulp.task('watch-scss', function () {
    gulp.watch('./public/dev/css/*.scss', ['scss']);
});

//css任务
gulp.task('cssmin', function () {
    gulp.src('./public/dev/css/*.css')
        .pipe(makeUrlVer())  //添加版本号
        .pipe(nano({     //压缩css
            discardUnused: false,
            zindex: false,
            reduceIdents: false,
            mergeIdents: false,
            colormin: false
        }))
        .pipe(concat('style.min.css'))   //合并文件
        .pipe(gulp.dest('./public/release/css/'));
});

//图片压缩任务
gulp.task('image', function () {
    gulp.src('./public/dev/images/*')
        .pipe(pngquant()())
        .pipe(imageminJpegoptim({progressive: true})())
        .pipe(gulp.dest('./public/release/images/'));
});

//js压缩任务
gulp.task('js', function () {
    gulp.src('./public/dev/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./public/release/js/'));
});

//html内文字替换
gulp.task('replace', function () {
    gulp.src('../*.html')
        .pipe(replace(/origin/g, 'banana'))
        .pipe(rename({
            basename: "change"
        }))
        .pipe(gulp.dest('../'));
});

//监视文件

