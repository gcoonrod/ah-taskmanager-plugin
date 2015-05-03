var mongoose = require("mongoose");
var _ = require('lodash');
var Q = require('q');

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
                    status: String,
                    data: {},
                    queue: String,
                    parent: ObjectId,
                    children: [ObjectId],
                    next: [ObjectId],
                    _createdDate: Date,
                    _modifiedDate: Date
                })
            },
            models: {},
            status: {
              NOT_STARTED: "NOT_STARTED",
                IN_PROGRESS: "IN_PROGRESS",
                COMPLETED: "COMPLETED",
                ERROR: "ERROR"
            },
            links: {
                NEXT: "NEXT",
                CHILD: "CHILD"
            },
            createTask: function(name, data, queue){
                var task =  new api.taskmanager.models.Task({
                    name: name,
                    status: api.taskmanager.status.NOT_STARTED,
                    data: data,
                    queue: queue,
                    _createdDate: new Date()
                });

                var deferred = Q.defer();

                task.save(function(err, task){
                    if(err){
                        deferred.reject(err);
                    } else {
                        deferred.resolve(task);
                    }
                });

                return deferred.promise;
            },
            linkTask: function(source, target, linkType){
                var Task = api.taskmanager.models.Task;
                var sourceTask, targetTask;
                var sourceUpdate, targetUpdate;
                var options = {
                    safe: true,
                    upsert: false,
                    new: true
                };
                var findTaskByIdAndUpdate = Q.nbind(Task.findByIdAndUpdate, Task);

                function buildUpdateQueries(type){
                    var types = api.taskmanager.links;
                    switch (type){
                        case types.CHILD:
                            sourceUpdate = {
                                $push: {children: target._id},
                                _modifiedDate: new Date()
                            };
                            targetUpdate = {parent: source._id};
                            break;
                        case types.NEXT:
                            sourceUpdate = {
                                $push: {next: target._id},
                                _modifiedDate: new Date()
                            };
                            targetUpdate = {parent: source._id};
                            break;
                        default:
                            api.log("TaskManager - Unsupported task link type!", "error");
                            throw new Error("Unsupported task link type!");
                    }

                    return Q();
                }

                return buildUpdateQueries(linkType)
                    .then(function(){
                        return findTaskByIdAndUpdate(source._id, sourceUpdate, options);
                    })
                    .then(function(_sourceTask){
                        sourceTask = _sourceTask;
                        return findTaskByIdAndUpdate(target._id, targetUpdate, options);
                    })
                    .then(function(_targetTask){
                        targetTask = _targetTask;
                        api.log("TaskManager: Tasks linked.", "debug", {
                            source: sourceTask,
                            target: targetTask
                        });
                    })
                    .catch(function(error){
                        api.log("TaskManager: Error linking tasks!", "error", error);
                    });


            }
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
                    api.taskmanager.models[name] = mongoose.model(name, schema);
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
