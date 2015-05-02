#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var localFile   = path.normalize(__dirname + '/../config/ah-taskmanager-plugin.js');
var projectFile = path.normalize(process.cwd() + '/../../config/plugins/ah-taskmanager-plugin.js');

function copyFile(source, target) {
    'use strict';
    var rd = fs.createReadStream(source);
    rd.on("error", function(err) {
        console.error(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function(err) {
        console.error(err);
    });
    wr.on("close", function(ex) {
        console.log("Done copying file.")
    });
    rd.pipe(wr);
}

if(!fs.existsSync(projectFile)){
    console.log("Copying configuration files for TaskManager Plugin");
    console.log("copying " + localFile + " to " + projectFile);
    copyFile(localFile, projectFile);
} else {
    console.log("Config file already exists!");
}

