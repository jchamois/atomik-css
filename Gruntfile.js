
'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: 'app',
    dist: 'dist',
    views : 'views',
    preview: 'preview',
    partials: 'partials',
    pages: 'pages',
    layout: 'layout',
    scripts : 'scripts',
    styles : 'styles',
    images : 'images'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {

      sass: {
        files: ['<%= yeoman.app %>/src/css/{,*/}*.{scss,sass}'],
        tasks: ['sass:server'],
         options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },

      gruntfile: {
        files: ['Gruntfile.js']
      },
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: 'http://localhost:9000/demo/',
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect().use(
                '/app/src/css',
                connect.static('./app/src/css')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      }
    },
    // Empties folders to start fresh
    clean: {
      server: '.tmp'
    },


    // Compiles Sass to CSS and generates necessary files if requested
    sass: {
      options: {
        sourceMap: true,
        sourceMapEmbed: true,
        sourceMapContents: true
      },
      server: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/src/css',
          src: ['*.{scss,sass}'],
          dest: '.tmp/src/css',
          ext: '.css'
        }]
      }
    },
  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      //return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'sass:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('default', [
    'serve'
  ]);
};
