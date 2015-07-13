module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
	watch: {
		scripts: {
		  files: ['*/*.js', 'Gruntfile.js'],
		  tasks: ['build'],
		  options: {
			spawn: false,
		  }
		},
		bower: {
			files: ['bower.json'],
			tasks: ['bower:dist']
		},
		html: {
			files: ['*.html'],
			tasks: ['copy']
		}
	},
	bower: {
		dist: {
			dest: '../game/scripts/third_party',
			options: {
				debugging: false,
			}
		}		
	},
	concat: {
      options: {
        separator: '\n\n'
      },
      dist: {
        src: ['*/*.js', ],
        dest: '../game/scripts/<%= pkg.name %>.js'
      }
	},
    uglify: {
      options: {
		mangle: false,
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: '../game/scripts/<%= pkg.name %>.js',
        dest: '../game/scripts/<%= pkg.name %>.min.js'
      }
    },
	copy: {
	  main: {
		files: [
		  // includes files within path
		  {expand: true, src: ['*.html'], dest: '../game/', filter: 'isFile'},
		],
	  },
	},
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('main-bower-files');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('build', ['bower:dist', 'concat', 'uglify', 'copy']);
  grunt.registerTask('default', ['build', 'watch']);

};