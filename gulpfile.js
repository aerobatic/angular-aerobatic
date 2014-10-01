var gulp = require('gulp'),
  ngAnnotate = require('gulp-ng-annotate'),
  uglify = require('gulp-uglify'),
  jshint = require('gulp-jshint'),
  rename = require('gulp-rename');

gulp.task('compress', function() {
  gulp.src('angular-aerobatic.js')
    .pipe(ngAnnotate())
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(rename('angular-aerobatic.min.js'))
    .pipe(gulp.dest('./'))
});

gulp.task('lint', function() {
  return gulp.src('angular-aerobatic.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
