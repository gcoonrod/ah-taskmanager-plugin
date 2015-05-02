'use strict';

module.exports = {
    startPriority: 810,
    loadPriority: 810,
    initialize: function(api, next) {
        api.log("Initializing TaskManger Plugin.", "debug");
        next();
    },
    start: function(api, next) {
        api.log("Starting TaskManager Plugin.", "debug");
        next();
    }
};
