var mongoose = require("mongoose");
var _ = require('lodash');

var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = {
    startPriority: 800,
    stopPriority: 800,
    loadPriority: 800,
    initialize: function(api, next) {
        'use strict';
        api.log("Initializing TaskManger Plugin.", "debug");
        api.taskmanager = {
            mongoose: mongoose,
            db: mongoose.connection,
            schemas: {
                Task: new Schema({
                    name: String,
                    data: {},
                    queue: String,
                    parent: ObjectId,
                    children: [ObjectId]
                })
            },
            models: {}
        };

        api.taskmanager.db
            .on("error", function(err){
            api.log("TaskManager - Error in MonboDB!", "error", err);
        })
            .on("close", function(err){
                if(err){
                    api.log("TaskManager - Error closing connection to MongoDB!", "error", err);
                } else {
                    api.log("TaskManager - Connection to MongoDB closed.", "debug");
                }
            });

        api.taskmanager.db
            .once("open", function(){
                api.log("TaskManager - MongoDB connection successful. Initializing Schemas.", "debug");
                _.forOwn(api.taskmanager.schemas, function(schema, name){
                    api.log("TaskManager - Compiling " + name + " schema into Mongoose model.", "debug");
                    api.taskmanager[name] = mongoose.model(name, schema);
                });
            });

        next();
    },
    start: function(api, next) {
        'use strict';

        if (api.config.taskmanager.active) {
            api.log("Starting TaskManager Initializer.", "debug");
            if (api.config.taskmanager.mongo) {
                var conn = "mongodb://"
                    .concat(api.config.taskmanager.mongo.host).concat(":")
                    .concat(api.config.taskmanager.mongo.port.toString()).concat("/")
                    .concat(api.config.taskmanager.mongo.database);
                api.log("Connecting to MongoDB: " + conn, "debug");
                api.taskmanager.mongoose.connect(conn);

                next();
            } else {
                api.log("TaskManager not configured!", "emerg");
                next(new Error("TaskManager not configured!"));
            }
        } else {
            next();
        }


    },
    stop: function(api, next){
        'use strict';
        api.log("Closing TaskManager connection to MongoDB.", "debug");
        api.taskmanager.db.close(next);
    }
};
