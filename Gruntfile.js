module.exports = function (grunt) {
    'use strict';
    // load npm tasks
    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    // config
    grunt.initConfig({
        jslint: {
            main: {
                src: [
                    '*.js'
                ],
                directives: {
                    node: true,
                    browser: false,
                    predef: [
                        'exports',
                        'require',
                        'module'
                    ]
                }
            }
        },
        watch: {
            js: {
                files: [
                    '*.js'
                ],
                tasks: ['jslint']
            }
        }
    });

    grunt.registerTask('watch_js', [
        'jslint',
        'watch:js'
    ]);
    grunt.registerTask('default', [
        'jslint',
        'watch'
    ]);
};
