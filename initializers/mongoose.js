'use strict';

module.exports = {
    startPriority: 500,
    loadPriority: 500,
    initialize: function(api, next) {
        api.log("Initializing Mongoose Initializer.", "debug");

        next();
    },
    start: function(api, next) {
        api.log("Starting Mongoose Initializer.", "debug");
    }
};
