var gulp = require('gulp');
var download = require("gulp-download");
var git = require('gulp-git');
var bower = require('gulp-bower');
var clean = require('gulp-clean');
var options = require('./options.json');


//clean old package.
gulp.task('clean', function(cb) {
  return gulp.src('./package')
  .pipe(clean({force: true}))
});

//clean old installation
gulp.task('cleanInstallation', function(cb) {
  return gulp.src('./output')
  .pipe(clean({force: true}))
});

//get the core
gulp.task('cloneWP',['clean'], function(cb) {
  git.clone(options.core, {args: './package/wordpress'}, function(err) {
    if(err)  console.log(err);
    cb();
  });
});

//get plugins (should be a series of callbacks.)
gulp.task('clonePlugins',['cloneWP'], function(cb) {
  var pluginsArray = options.plugins;
  var promisesSolved = 0;

  function solver(){
    promisesSolved++;
    if(promisesSolved == pluginsArray.length ){
      cb();
    }
  };

  for(var i=0;i<pluginsArray.length;i++){
    git.clone(pluginsArray[i].link, {args: './package/plugins/'+ pluginsArray[i].name}, function(err) {
      if(err)  console.log(err);
      solver();
    });
  }
});

//get themes
gulp.task('cloneThemes',['cloneWP'], function(cb) {
  var themesArray = options.themes;
  var promisesSolved = 0;

  function solver(){
    promisesSolved++;
    if(promisesSolved == themesArray.length ){
      cb();
    }
  };

  for(var i=0;i<themesArray.length;i++){
    git.clone(themesArray[i].link, {args: './package/themes/'+ themesArray[i].name}, function(err) {
      if(err)  console.log(err);
      solver();
    });
  }
});

gulp.task('default',['cloneWP','clonePlugins','cloneThemes','cleanInstallation'], function() {

  //mount package
  gulp.src(['./package/wordpress/**/*']).pipe(gulp.dest('./output'));
  gulp.src(['./package/plugins/**/*']).pipe(gulp.dest('./output/wp-content/plugins'));
  gulp.src(['./package/themes/**/*']).pipe(gulp.dest('./output/wp-content/themes'));

  console.log("ALL FINISH, DING DING!");
});
