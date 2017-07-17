var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat-util');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var less = require('gulp-less');
var replace = require('gulp-replace');
var merge = require('merge-stream');

// set paths
var path = {
   'src': './src',
   'build': './build',
   'nodemodules': './node_modules'
};

// set of tasks to be run
var tasks = [
   'less'
];

gulp.task('less', function() {
  var sources = {
    'contributing.less': 'contributing.css',
    'embed.less': 'embed.css',
    'page.less': 'page.css',
    'testing.less': 'testing.css',
    'ui.less': 'app.css'
  };
  var streams = [];

  Object.keys(sources).forEach(function(sourceFileName) {
    var src = path.src + '/less/' + sourceFileName;
    var destFileName = sources[sourceFileName];
    var stream = gulp.src(src, {
         read: true
      })
      .pipe(less())
      .pipe(cleanCSS())
      .pipe(sourcemaps.write('.'))
      .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
      .pipe(rename(destFileName))
      .pipe(gulp.dest(path.build + '/assets/style')
    );
    streams.push(stream);
  });

  return merge(streams);
});

gulp.task('default', tasks);