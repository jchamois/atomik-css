'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const del = require('del');

gulp.task('styles', () => {
    return gulp.src('app/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('app/css/'));
});

gulp.task('clean', () => {
    return del([
        'app/css/styles.css',
    ]);
});

gulp.task('default', gulp.series(['clean', 'styles']));

gulp.task('watch', () => {
    gulp.watch('app/scss/*.scss', (done) => {
        gulp.series(['clean', 'styles'])(done);
    });
});