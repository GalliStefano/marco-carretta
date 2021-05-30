"use strict";

// Load plugins
const cache = require('gulp-cache');
const del = require('del');
const {src, dest, series, parallel, watch} = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const fileinclude = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const browserify = require('browserify');
const babelify = require("babelify");
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify-es').default;
const notify = require('gulp-notify');
const browserSync = require('browser-sync').create();

// Paths to project folders
const paths = {
	dev: 'src',
	dist: 'dist',
	scripts: {
		dev: 'src/js/*.js',
		dist: 'dist/js/',
		main: 'src/js/main.js'
	},
	styles: {
		dev: 'src/scss/*.{scss,sass}',
		dist: 'dist/css/',
		main: 'dist/css/main.min.css'
	},
	fonts: {
		dev: 'src/font/*.{eot,otf,svg,woff,ttf}',
		dist: 'dist/font/'
	},
	images: {
		dev: 'src/images/*',
		dist: 'dist/images/'
	},
	html: {
		dev: 'src/pages/**/*.html',
		dist: 'dist/'
	}
};

// clear CACHE
function clearCache() {
	return cache.clearAll();
}

// clean build folder
function clean() {
	return del(`${paths.dist}/**`);
}

// BrowserSync
function serve(cb) {
	browserSync.init({
		server: {
			baseDir: "dist",
			index: "index.html"
		},
		logPrefix: 'ʕ•ᴥ•ʔ BrowserSync'
	});
	cb();
}

// BrowserSync Reload
function browserSyncReload(cb) {
  browserSync.reload();
  cb();
}

// import fonts
function fonts() {
  return src(paths.fonts.dev)
    .pipe(dest(paths.fonts.dist))
    // .pipe(notify({ message: "fonts moved!!!", onLast: true }))
    .pipe(browserSync.stream());
}

// Copy and optimize img in dist folder
function images(cb) {
	imagemin([paths.images.dev], {
		destination: paths.images.dist,
		plugins: [
			imageminJpegtran({
				progressive: true
			}),
			imageminPngquant({
				quality: [0.6, 0.8]
			}),
			imageminSvgo(),
		]
	});
	cb();
}

// CSS task
function css() {
	return src(paths.styles.dev)
		.pipe(sass({outputStyle: 'compressed', includePaths: ["node_modules"]}).on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(cleanCSS({level: {1: {specialComments: 0}, 2: {}}}))
		.pipe(rename({ suffix: '.min' }))
		.pipe(dest(paths.styles.dist))
		// .pipe(notify({ message: "Css compiled!!!", onLast: true }))
		.pipe(browserSync.stream());
}

// Copy html in dist folder
function html() {
	return src(paths.html.dev)
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(dest(paths.html.dist))
		// .pipe(notify({ message: "Html compiled!!!", onLast: true }))
		.pipe(browserSync.stream());
}

// Copy, concatenate and minify prod html
function minHtml() {
	return src(paths.html.dev)
		.pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(dest(paths.html.dist))
		// .pipe(notify({ message: "Html compiled!!!", onLast: true }))
		.pipe(browserSync.stream());
}

// Copy js in dist folder
function js() {
	return browserify({entries: paths.scripts.main})
		.bundle()
		.pipe(source("main.js"))
		.pipe(rename({ suffix: '.min' }))
		.pipe(dest(paths.scripts.dist))
		// .pipe(notify({ message: "Js compiled!!!", onLast: true }))
		.pipe(browserSync.stream());
}

// Transpile, concatenate and minify scripts
function minJs() {
	return browserify({entries: paths.scripts.main})
		.transform(babelify)
		.bundle()
		.pipe(source("main.js"))
		.pipe(buffer())
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(dest(paths.scripts.dist))
		// .pipe(notify({ message: "Js compiled!!!", onLast: true }))
		.pipe(browserSync.stream());
}

// Watch files
function watchFiles() {
	watch(paths.styles.dev, css)
	watch('src/**/*.{html,njk}').on("change", series(html, browserSyncReload))
	watch(paths.images.dev, series(images, browserSyncReload))
	watch(paths.scripts.dev, series(js, browserSyncReload))
}

// Define complex tasks
const watcher = parallel(watchFiles, serve);
const build = series(clean, clearCache, parallel(fonts, images, css, js, html));
const buildProd = series(clean, clearCache, parallel(fonts, images, css, minJs, minHtml));
const dev = series(build, watcher);
const prod  = series(buildProd, watcher);

// Export tasks
exports.clearCache = clearCache;
exports.clean = clean;
exports.fonts = fonts;
exports.images = images;
exports.css = css;
exports.js = js;
exports.minJs = minJs;
exports.html = html;
exports.minHtml = minHtml;
exports.serve = serve;

exports.default = build;
exports.dev = dev;
exports.prod = prod;