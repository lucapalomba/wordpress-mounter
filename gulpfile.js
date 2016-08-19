
var gulp = require('gulp');
var download = require("gulp-download");
var git = require('gulp-git');
var clean = require('gulp-clean');
var options = require('./options.json');
var decompress = require('gulp-decompress');
var rename = require('gulp-rename');


gulp.task('test',[], function(CB) {

});

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
gulp.task('createWP',['clean'], function(cb) {

  var wordpressFolder = './package/wordpress';

  switch(options.coreType) {
    case 'git':
    return  git.clone(options.core, {args: wordpressFolder}, function(err) {
      if(err)  console.log(err);
      cb();
    });
    break;
    default:
    return  download(options.core).pipe(decompress({strip: 1})).pipe(gulp.dest(wordpressFolder));
  }

});

//get plugins
gulp.task('clonePlugins',['createWP'], function(cb) {
  var downloader = [];
  for(var i=0;i<options.plugins.length;i++){
    downloader.push(options.plugins[i].link);
  }
  return  download(downloader).pipe(gulp.dest('./package/plugins/'));
});

//get plugins zip and decompress to the real folder.
gulp.task('decompressPlugins',['clonePlugins'], function() {
  return gulp.src('./package/plugins/*.{tar,tar.bz2,tar.gz,zip}')
  .pipe(rename(function(pathObj){
    pathObj.dirname = pathObj.dirname + pathObj.basename;
    return pathObj;
  }))
  .pipe(decompress())
  .pipe(gulp.dest('./package/plugins'));
});

//get themes
gulp.task('cloneThemes',['createWP'], function(cb) {
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

gulp.task('default',['decompressPlugins','cloneThemes','cleanInstallation'], function() {

  //mount package
  gulp.src(['./package/wordpress/**/*',,'./package/wordpress/*.{tar,tar.bz2,tar.gz,zip,git}']).pipe(gulp.dest('./output'));
  gulp.src(['./package/plugins/**/*','./package/plugins/*.{tar,tar.bz2,tar.gz,zip,git}']).pipe(gulp.dest('./output/wp-content/plugins'));
  gulp.src(['./package/themes/**/*',,'./package/themes/*.{tar,tar.bz2,tar.gz,zip,git}']).pipe(gulp.dest('./output/wp-content/themes'));

  console.log("ALL FINISH, DING DONG!");
});
