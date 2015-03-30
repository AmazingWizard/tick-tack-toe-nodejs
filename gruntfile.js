module.exports = function(grunt) {

  //Creates a reference to the package obj
  var pkg = require('./package.json');

  //Checks the dependencies associated with Grunt and autoloads
  //& requires ALL of them in this Gruntfile
  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({

    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
        }
      },
      dist: {
        options: {
          base: '~/<%= pkg.name %>'
        }
      }
    },
    //Jade configuration
    jade: {
        pretty: {
            files: [{
                expand: true,
                cwd: 'jade/',
                src: ['**/*.jade'],
                dest: './',
                ext: '.html',
                extDot: 'first'
            }],
        options: {
            pretty: true,
            }
        }
    },
    //Sass configuration
    sass: {
      dev: {
        options: {
          style: 'expanded',
          compass: true
        },
        files: {
          './css/main-style.css': './css/sass/main-style.scss'
        }
      }
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 2 version', 'ie 8', 'ie 9'],
        diff: true
      },
      single_file: {
        files: [{
          expand: true,
          cwd: 'css/',
          src: '{,*/}*.css',
          dest: 'css/'
        }]
      }
    },//autoprefixer

    //compass -required for autoprefixer
    compass: {
      options: {
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },

    //Watches files and folders for us
    watch: {

      //watch to see if we change this gruntfile
      gruntfile: {
        files: ['Gruntfile.js']
      },

      //sass
      sass: {
        files: 'css/{,*/}*.{scss,sass}',
        tasks: ['sass:dev']
      },

      //compass
      compass: {
        files: ['css/{,*/}*.css'],
        tasks: ['compass:server', 'autoprefixer']
      },

      //livereload
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '{,*/}*.html',
          '{,*/}*.php',
          'js/{,*/}*.js',
         // 'css/{,*/}*.css',
          'css/{,*/}*.scss',
          'images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      },

      //Jade
      jade: {
        files: 'jade/{,*/}*.jade',
        tasks: ['jade']
      },

    }// watch

  });//grunt.initConfig

  grunt.registerTask('create', function (target) {
      if (grunt.file.exists('./css')) {

      } else {
          grunt.file.write('./css/sass/main-style.scss','@import \'reset\';\n@import \'colors\';\n@import \'vars\';\n');
          grunt.file.write('./css/sass/_reset.scss');
          grunt.file.write('./css/sass/_colors.scss');
          grunt.file.write('./css/sass/_vars.scss');
      }
      if (grunt.file.exists('./jade')) {

      } else {
        grunt.file.write('./jade/index.jade', 'Your staring Jade file.');
      }
  });
  //grunt serve
  grunt.registerTask('serve', function (target) {

    grunt.task.run([
      'connect:livereload',
      'watch',
      'sass:dev'
      ]);
  });
};//module.exports
