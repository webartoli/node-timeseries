var gulp = require('gulp');
var mocha = require('gulp-mocha');
var watch = require('gulp-watch');

gulp.task('test', function () {
    return gulp.src('tests/**/*.js').pipe(mocha());
});

gulp.task('default', ['test'],function () {
	return gulp.watch(['*.js','tests/*.js'], ['test']);
});