// let gulp = require("gulp");
const { src, dest, watch, series } = require("gulp");

const { deploy } = require("gulp-gh-pages");

const sourcemaps = require("gulp-sourcemaps");
const terser = require("gulp-terser");
const concat = require("gulp-concat");

function minifyJS() {
  return src("scripts/*.js").pipe(terser()).pipe(dest("dist/scripts"));
}
// /**
//  * Push build to gh-pages
//  */
// gulp.task("deploy", function () {
//   return src("./dist/**/*").pipe(deploy());
// });

exports.default = series(minifyJS);
