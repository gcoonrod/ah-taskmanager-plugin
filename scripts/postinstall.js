#!/usr/bin/env node

var fs = require('fs-extra');
var path = require('path');

var localFile   = path.normalize(__dirname + '/../config/ah-taskmanager-plugin.js');
var projectFile = path.normalize('/ah-taskmanager-plugin.js');
var pluginFolder = path.normalize(process.cwd() + '/../../config/plugins');

console.log("Copying configuration files for TaskManager ActionHero plugin");
fs.ensureDir(pluginFolder, function(err){
    if(err){
        console.error("Unable to ensure that '" + pluginFolder + "' exists!", err);
    } else {
        fs.stat(pluginFolder.concat(projectFile), function(err, stats){
            if(err == null) {
                console.log('Config file already exists!');
            } else if(err.code == 'ENOENT') {
                fs.copy(localFile, pluginFolder.concat(projectFile), function(err){
                    if(err){
                        console.error("Unable to copy configuration files!", err);
                    } else {
                        console.log("Successfully copied TaskManager configuration files!");
                    }
                });
            } else {
                console.log('Some other error: ', err.code);
            }
        });
    }
});

