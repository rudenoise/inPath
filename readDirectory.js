var allFiles = [],
    fs = require('fs');


function createCallBackChannel(masterCallBack) {
    // a mechanism to create a "channel"
    // for nested/parallel callbacks to be wrapped in
    // as the program runs
    // more call backs can be added to the channel
    // once the total callbacks registered and fired
    // are equal fire the channel's callback
    'use strict';
    var totalCallBacksRegistered = 0,
        totalCallBacksFired = 0;

    return function (fn) {
        totalCallBacksRegistered += 1;
        return fn.name !== '' ?
                // not an anonimous function
                // so wrap and track its execution
                function () {
                    totalCallBacksFired += 1;
                    var argsArr = Array.prototype.slice.call(arguments, 0);
                    fn.apply(null, argsArr);
                    if (
                        totalCallBacksRegistered ===
                            totalCallBacksFired
                    ) {
                        masterCallBack();
                    }
                } :
                // the function is anon so it must have
                // been wrapped already, don't interfere
                fn;
    };

}

// create a channel to wrap new callbacks
// generated on a per directory basis
var fileChannelWrap = createCallBackChannel(function () {
    // all directories have been traversed
    // and sub-directories recursed
    // print out the paths of all found files
    // the end
    'use strict';
    var l = allFiles.length - 1, p = 0;
    while (p <= l) {
        process.stdout.write(allFiles[p] + '\n');
        p = p + 1;
    }
    process.exit(0);
});

function dirReadDone(filesList) {
    // when a directory has been read
    // feed its file paths here to be collated
    'use strict';
    allFiles = allFiles.concat(filesList);
}

function readDir(path, cb) {
    // read the contents of a directory
    // using the path and feed paths of files
    // contained with in to the callback
    'use strict';
    var files = [],
        dirs = [],
        others = [],
        directoryDone  = function (directories, files) {
            // directoryDone is a question not a statement
            var dirLen = directories.length;
            // now that the current directory has
            // finished reading, loop child directories
            // and recurse
            while (dirLen > 0) {
                // recurse
                // read the child directories
                // and use the file channel to
                // wrap/resister a new callback
                readDir(
                    directories[dirLen - 1],
                    fileChannelWrap(cb)
                );
                dirLen = dirLen - 1;
            }
            // pass files to the call-back that will
            // do something with all the file paths
            cb(files);
        },
        makeStatCB = function (thing, len) {
            // generate a call-back that will be fed to
            // fs.stat and fired when checking what a "thing"
            // in a directory is (file, dir etc...)
            return function (err, stats) {
                // a function that is fired by fs.stat
                // and collects files and directories
                if (err !== null) {
                    console.error(err);
                    process.exit(1);
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
        };

    fs.readdir(path, function (err, things) {
        // read a given directory and analise
        // "things" within in it
        if (err !== null) {
            // something bad occurred
            console.error(err);
            process.exit(1);
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

exports.readDir = readDir;
exports.fileChannelWrap = fileChannelWrap;
exports.dirReadDone = dirReadDone;
