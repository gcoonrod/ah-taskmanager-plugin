var grunt = require('grunt');

var src = [
    "actions/**/*.js",
    "config/**/*.js",
    "initializers/**/*.js",
    "plugins/**/*.js",
    "schemas/**/*.js",
    "tasks/**/*.js",
    "test/**/*.js",
    "utils/**/*.js",
    "gruntfile.js",
    "!plugins/**/node_modules/**/*.js",
    "!config/properties.js"
];

grunt.initConfig({
    "jsbeautifier": {
        "default": {
            src: src
        },
        "git-pre-commit": {
            src: src,
            options: {
                mode: "VERIFY_ONLY"
            }
        }
    },
    jshint: {
        all: src,
        jshintrc: true
    }
});

grunt.loadNpmTasks("grunt-jsbeautifier");
grunt.loadNpmTasks('grunt-contrib-jshint');

grunt.registerTask("beautify", ['jsbeautifier']);
grunt.registerTask("check", ['jsbeautifier:git-pre-commit']);
grunt.registerTask('default', ['jsbeautifier:git-pre-commit', 'jshint']);

require('actionhero/grunt')(grunt);
