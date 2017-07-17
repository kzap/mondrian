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
var haml = require('gulp-haml');
var coffee = require('gulp-coffee');
var fs = require('fs');
var gutil = require('gulp-util');
var jsyaml = require('js-yaml');

// set paths
var path = {
  'src': {
    'app': './src/app',
    'base': './src',
    'coffee': './src/coffee',
    'haml': './src/haml',
    'less': './src/less'
  },
  'build': {
    'app': './build/app',
    'base': './build',
    'css': './build/assets/style',
    'fonts': './build/assets/fonts',
    'javascript': './build/assets/javascript',
    'images': './build/assets/images',
    'vendor': './build/assets/vendor'
  },
  'nodemodules': './node_modules'
};

// set of tasks to be run
var tasks = [
  'appcache',
  'coffee',
  'less',
  'haml'
];

var getCoffeeFiles = function(keys) {
  var paths, src;
  paths = [];
  src = jsyaml.safeLoad(fs.readFileSync('./build.yml', 'utf8')).src;
  if (keys != null) {
    src = src.filter(function(module) {
      return keys.indexOf(Object.keys(module)[0]) > -1;
    });
  }

  src.forEach(function(module) {
    var dir, fn, fns, key;
    key = Object.keys(module)[0];
    fns = module[key];
    if (typeof fns[0] === 'object' && fns[0]._dir !== void 0) {
      dir = fns[0]._dir;
      fns = fns.slice(1);
    } else {
      dir = key;
    }

    return paths = paths.concat((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = fns.length; i < len; i++) {
        fn = fns[i];
        results.push("src/coffee/" + (dir || '') + (dir ? '/' : '') + fn + ".coffee");
      }
      return results;
    })());
  });

  return paths;
};

var getGitHeadSHA = function(cb) {
  fs.readFile('.git/HEAD', 'utf8', function(err, ref) {
    if (err || typeof ref !== "string") {
      console.log('Missing or malformed git HEAD - SHA unavailable.');

      return cb(null);
    }
    getGitSHAFromRef('.git/' + ref.slice(4, ref.length).trim(), cb);
  });
}

var getGitSHAFromRef = function(ref, cb) {
  fs.readFile(ref, 'utf8', function(err, sha) {
    if (err || typeof sha !== "string") {
      console.log('Missing or malformed git branch SHA.');

      return cb(null);
    }

    cb(sha.trim());
  });
}

gulp.task('appcache', function() {
  fs.readFile(path.build.app + '/mondrian.appcache', 'utf8', function(err, currentFile) {
    // default buildno
    buildNum = 1
    // get existing buildno
    if (currentFile) {
      buildNum = parseInt(/^# Revision (\d+)$/m.exec(currentFile)[1]) + 1;
    }

    var header = 'CACHE MANIFEST\n# Revision ' + buildNum + '\n'
    getGitHeadSHA(function(sha) {
      header += '# SHA ' + sha + '\n'
      header += '# Date: ' + new Date().toDateString() + '\n'
      fs.readFile(path.src.app+'/mondrian.appcache', 'utf8', function(err, data) {
        if (err || typeof data !== "string") {
          console.log("'" + path.src.app + "/mondrian.appcache' is missing or malformed.")
          console.log("Unable to compile appcache.")

          return
        }

        fs.writeFile(path.build.app + '/mondrian.appcache', header + data);
      });
    });
  });
});

gulp.task('coffee', function() {
  var coffeeFiles = getCoffeeFiles();

  return gulp.src(coffeeFiles)
    .pipe(concat('build.js'))
    .pipe(coffee({bare:true}).on('error', gutil.log))
    .pipe(gulp.dest(path.build.javascript))
  ;
});

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
    var src = path.src.less + '/' + sourceFileName;
    var destFileName = sources[sourceFileName];
    var stream = gulp.src(src, {
         read: true
      })
      .pipe(less())
      .pipe(cleanCSS())
      .pipe(sourcemaps.write('.'))
      .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
      .pipe(rename(destFileName))
      .pipe(gulp.dest(path.build.css))
    ;
    streams.push(stream);
  });

  return merge(streams);
});

gulp.task('haml', function() {
  var sources = {
    'xml.haml': 'xml/index.html',
    'contributing.haml': 'contributing/index.html'
  };
  var streams = [];

  Object.keys(sources).forEach(function(sourceFileName) {
    var src = path.src.haml + '/' + sourceFileName;
    var destFileName = sources[sourceFileName];
    var stream = gulp.src(src, {
         read: true
      })
      .pipe(haml())
      .pipe(rename(destFileName))
      .pipe(gulp.dest(path.build.base))
    ;
    streams.push(stream);
  });

  return merge(streams);
});

gulp.task('default', tasks);