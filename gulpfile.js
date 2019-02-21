'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');

//compile
gulp.task('sass', function() {
    gulp.src('app/scss/styles.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('app/css'));
});

//compile and watch

gulp.task('sass:watch', function() {
    gulp.watch('app/scss/*.scss',  gulp.series('sass'));
});