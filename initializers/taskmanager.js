'use strict';

module.exports = {
    startPriority: 500,
    loadPriority: 500,
    initialize: function(api, next){
        api.log("Initializing TaskManger Plugin.", "debug");
        next();
    },
    start: function(api, next){
        api.log("Starting TaskManager Plugin.", "debug");
        next();
    }
};
