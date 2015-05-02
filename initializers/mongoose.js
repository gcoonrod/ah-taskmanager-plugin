var mongoose = require("mongoose");

module.exports = {
    startPriority: 800,
    loadPriority: 800,
    initialize: function(api, next) {
        'use strict';
        api.log("Initializing Mongoose Initializer.", "debug");
        api.mongoose = {
            mongoose: mongoose,
            connect: mongoose.connect,
            db: mongoose.connection,
        };

        api.mongoose.db.on("error", function(err) {
            api.log("Error in Mongoose!", "error", err);
        });

        api.mongoose.db.once("open", function() {
            api.log()
        });

        next();
    },
    start: function(api, next) {
        'use strict';

        if (api.config.taskmanager.active) {
            api.log("Starting Mongoose Initializer.", "debug");
            if (api.config.taskmanager.mongo) {
                var conn = "mongodb://"
                    .concat(api.config.taskmanager.mongo.host).concat(":")
                    .concat(api.config.taskmanager.mongo.port).concat("/")
                    .concat(api.config.taskmanager.mongo.database);
                api.log("Connecting to MongoDB: " + conn, "debug");
                api.mongoose.mongoose.connect(conn);

                next();
            } else {
                api.log("TaskManager not configured!", "emerg");
                next(new Error("TaskManager not configured!"));
            }
        } else {
            next();
        }


    }
};
