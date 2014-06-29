'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    templateCache = require('gulp-angular-templatecache'),
    angularFilesort = require('gulp-angular-filesort'),
    ngAnnotate = require('gulp-ng-annotate'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('lint', function() {
  return gulp.src('angular-app/**/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
});

gulp.task('compile-js', function() {
  return gulp.src(['angular-app/**/*.js', 'tmp/templates.js'])
      .pipe(angularFilesort())
      .pipe(concat('application.js'))
      .pipe(ngAnnotate({
        add: true,
        single_quotes: true
      }))
      .pipe(gulp.dest('dist'))
      .pipe(rename('application.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('dist'));
});

gulp.task('compile-templates', function() {
  return gulp.src('angular-app/**/*.html')
      .pipe(templateCache('templates.js', {
        module: 'App'
      }))
      .pipe(gulp.dest('tmp'));
});

gulp.task('sass', function() {
  return gulp.src('angular-app/**/*.scss')
      .pipe(sass())
      .pipe(concat('application.css'))
      .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch('angular-app/**/*.html', ['compile-templates']);
  gulp.watch(['angular-app/**/*.js', 'tmp/templates.js'], ['lint', 'compile-js']);
  gulp.watch('angular-app/**/*.scss', ['sass']);
});

gulp.task('default', ['lint', 'compile-js', 'watch']);
