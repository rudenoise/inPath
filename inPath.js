var fs = require('fs'),
    allFiles = [],
    startPath = process.argv[process.argv.length - 1];

function createCallBackChannel(masterCallBack) {
    'use strict';
    var totalCallBacksRegistered = 0,
        totalCallBacksFired = 0;

    return function (fn) {
        totalCallBacksRegistered += 1;
        return fn.name !== '' ?
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
                } : fn;
    };

}

var fileChannelWrap = createCallBackChannel(function () {
    'use strict';
    var l = allFiles.length - 1, p = 0;
    while (p <= l) {
        process.stdout.write(allFiles[p] + '\n');
        p = p + 1;
    }
    process.exit(0);
});


function dirReadDone(filesList) {
    'use strict';
    allFiles = allFiles.concat(filesList);
}

var readDir = function (path, cb) {
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
            thing = things[l - 1];
            fs.stat(path + thing, makeStatCB(thing, l));
            l = l - 1;
        }
    });
};

readDir(startPath, fileChannelWrap(dirReadDone));
