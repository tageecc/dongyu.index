var gulp = require('gulp'),
    minifyCSS = require('gulp-minify-css'),
    spriter = require('gulp-css-spriter2');

gulp.task('spriter', function() {

    var timestamp = +new Date();
    //需要自动合并雪碧图的样式文件
    return gulp.src('./public/dev/css/style.css')
        .pipe(spriter({
            // 生成的spriter的位置
            'spriteSheet': './public/release/images/sprite.png',
            // 生成样式文件图片引用地址的路径
            'pathToSpriteSheetFromCSS': '../images/sprite.png?_t='+timestamp
        }))
        .pipe(minifyCSS())
        //产出路径
        .pipe(gulp.dest('./public/release/css'));
});