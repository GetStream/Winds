/**
 * Compile JSX files to JavaScript.
 *
 * ---------------------------------------------------------------
 *
 * Compiles jsx files from `assest/js` into Javascript and places them into
 * `.tmp/public/js` directory.
 *
 */
// module.exports = function(grunt) {
//
//   grunt.config.set('babel', {
//     dev: {
//       options: {
//         presets: ['react']
//       },
//       files: [{
//         expand: true,
//         cwd: 'assets/js/',
//         src: ['**/*.jsx'],
//         dest: '.tmp/public/js/',
//         ext: '.js'
//       }]
//     }
//   });
//
//   grunt.loadNpmTasks('grunt-babel');
// };
module.exports = function(grunt) {

    grunt.config.set('babel', {
      dev: {
        options: {
            presets: ['react']
        },
        files: [{
          expand: true,
          cwd: 'assets/js/',
          src: ['**/*.js', '!dependencies/**/*.js'],
          dest: '.tmp/public/js/',
          ext: '.js'
        }]
      }
    });

    grunt.loadNpmTasks('grunt-babel');
};
