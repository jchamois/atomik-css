const gulp = require('gulp');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const clean = require('gulp-clean');
const sass = require('gulp-sass')(require('sass'));
const browsersync = require('browser-sync').create()


// edit this to change release name file

const releaseJS = 'scripts';
const releaseCSS = 'style';

// PATH

const srcPath = 'src';
const jsPath = `${srcPath}/js`;
const scssPath = `${srcPath}/scss`;
const distPath = 'dist';

// ADD FILE MANUALLY TO ENSURE IT'S COMPILED IN ORDER

const jsFiles = [`${jsPath}/*.js`];

function browsersyncServer(cb){
    browsersync.init({
        server: {
            baseDir: ['./src', './']
        }
    });
    cb();
}

function browsersyncReload(cb){
    browsersync.reload()
    cb();
}

function cleanJs() {
    return gulp.src(`${distPath}/js/*`, {read: false, allowEmpty: true})
    .pipe(clean())
}


function cleanCss() {
    return gulp.src(`${distPath}/css/*`, {read: false, allowEmpty: true})
    .pipe(clean())
}

function jsTask() {
    return gulp.src(`${jsPath}/*.js`)
        .pipe(sourcemaps.init())
        //  .pipe(babel({
        //         presets: ['@babel/env']
        // }))
        .pipe(terser({
            format: {
                comments: false
            }
        }))
        .pipe(concat(`${releaseJS}.js`))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(`${distPath}/js/`));
}

function cssTask() {
    return gulp.src(`${scssPath}/styles.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer({
            cascade: false
        }), cssnano()]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(`${distPath}/css`));
}

function watchTask() {
    gulp.watch(`${scssPath}/*.scss`, { usePolling: true }, gulp.series(cssTask, browsersyncReload));
    gulp.watch(`${jsPath}/*.js`, { usePolling: true }, gulp.series(jsTask, browsersyncReload));
    gulp.watch(`${srcPath}/*.html`, { usePolling: true }, gulp.series(browsersyncReload));
}

exports.cssTask = cssTask;
exports.browsersyncServer = browsersyncServer;
exports.browsersyncReload = browsersyncReload;
exports.cleanCss = cleanCss;
exports.cleanJs = cleanJs;
exports.jsTask = jsTask;
exports.watchTask = watchTask;

// TASKS

exports.live = gulp.series(gulp.parallel(cleanJs, cleanCss, jsTask, cssTask),browsersyncServer, watchTask);
exports.dist = gulp.series(gulp.parallel(cleanJs, cleanCss, jsTask, cssTask));


