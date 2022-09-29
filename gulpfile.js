// let gulp = require("gulp");
const { src, dest, watch, series, task } = require("gulp");

const { deploy } = require("gulp-gh-pages");

const sourcemaps = require("gulp-sourcemaps");
const terser = require("gulp-terser");
const concat = require("gulp-concat");

function minifyJS() {
  return src("scripts/*.js").pipe(terser()).pipe(dest("dist/scripts"));
}

async function watchTask() {
  watch("scripts/*.js", minifyJS);
}

// /**
//  * Push build to gh-pages
//  */
task("deploy", function () {
  return src("./dist/**/*").pipe(deploy());
});

exports.default = series(minifyJS, watchTask, deploy);
