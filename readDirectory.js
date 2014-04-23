var fs = require('fs');

module.exports = function (startPath, allDirsReadCB) {
    'use strict';
    var allFiles = [], fileChannel;

    function createCallBackChannel(masterCallBack) {
        // [1.1] a mechanism to create a "channel"
        // for nested/parallel callbacks to be wrapped in
        // as the program runs
        // more call backs can be added to the channel
        // once the total callbacks registered and fired
        // are equal fire the channel's callback
        var totalCallBacksRegistered = 0,
            totalCallBacksFired = 0;

        return function (aggregatingCB) {
            totalCallBacksRegistered += 1;
            return aggregatingCB.name !== '' ?
                    // not an anonimous function
                    // so wrap and track its execution
                    function () {
                        totalCallBacksFired += 1;
                        var argsArr = Array.prototype.slice.call(arguments, 0);
                        aggregatingCB.apply(null, argsArr);
                        if (
                            totalCallBacksRegistered ===
                                totalCallBacksFired
                        ) {
                            masterCallBack();
                        }
                    } :
                    // the function is anon so it must have
                    // been wrapped already, don't interfere
                    aggregatingCB;
        };

    }


    function readDirDone(filesList) {
        // [3] when a directory has been read
        // feed its file paths here to be collated
        allFiles = allFiles.concat(filesList);
    }

    function readDir(path, cb) {
        // read the contents of a directory
        // using the path and feed paths of files
        // contained with in to the callback
        var files = [],
            dirs = [],
            others = [];

        function directoryDone(directories, files) {
            var dirLen = directories.length;
            // [2.2] now that the current directory has
            // finished reading, loop child directories
            // and recurse
            while (dirLen > 0) {
                // recurse
                // read the child directories
                // and use the file channel to
                // wrap/resister a new callback
                readDir(
                    directories[dirLen - 1],
                    fileChannel(cb)
                    // wrap/increase the  directoryDone "channel"
                );
                dirLen = dirLen - 1;
            }
            // pass files to the call-back that will
            // do something with all the file paths
            cb(files);
            // in this case readDirDone
        }

        function makeStatCB(thing, len) {
            // [2.1] generate a call-back that will be fed to
            // fs.stat and fired when checking what a "thing"
            // in a directory is (file, dir etc...)
            return function (err, stats) {
                // a function that is fired by fs.stat
                // and collects files and directories
                if (err !== null) {
                    return allDirsReadCB(err);
                }
                if (stats.isFile()) {
                    files.push(path + thing);
                } else if (stats.isDirectory()) {
                    dirs.push(path + thing + '/');
                } else {
                    others.push(path + thing);
                }
                if (len <= 1) {
                    // the directory has been read
                    // now check child directories
                    // and send the collected file paths on
                    directoryDone(dirs, files);
                }
            };
        }

        // [2] readDir starts here:
        // fs.readdir takes the current path/dir and
        // reads its contents,
        // each "thing" within a directory is fed to
        // makeStatCB to determine what it is
        // at the end of each directory
        // the directoryDone function is fired
        fs.readdir(path, function (err, things) {
            // read a given directory and analise
            // "things" within in it
            if (err !== null) {
                // something bad occurred
                return allDirsReadCB(err, []);
            }
            var l = things.length, thing;
            if (l === 0) {
                directoryDone(dirs, files);
            }
            while (l > 0) {
                // loop the "things" within current directory
                // feed them to fs.stat to work out what they are
                thing = things[l - 1];
                fs.stat(path + thing, makeStatCB(thing, l));
                l = l - 1;
            }
        });
    }

    // [0.1] create a channel to wrap new callbacks
    // generated on a per directory basis
    fileChannel = createCallBackChannel(function () {
        // [1.2] all directories have been traversed
        // and sub-directories recursed
        // send the final collection of file paths
        // to the allDirsReadCB
        // the end
        allDirsReadCB(null, allFiles);
    });

    // [1.0] start here:
    // take the path,
    // wrap the readDirDone callback in a "channel"
    // this allows new callbacks to be added as
    // directories are discovered these can be aggregated
    // the readDir function feeds the path and the channel to
    // fs.readdir, recursing child directories
    readDir(
        startPath,
        fileChannel(
            readDirDone
        )
    );
};

