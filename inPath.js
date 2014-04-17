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
        console.log(allFiles[p]);
        p = p + 1;
    }
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
        directoryDone  = function (len) {
            // directoryDone is a question not a statement
            var dirLen = dirs.length;
            if (len <= 1) {
                // now that the last thing has been checked
                // the directory contents has been collected
                // start reading child dirs
                // then fire callback
                while (dirLen > 0) {
                    readDir(dirs[dirLen - 1], fileChannelWrap(cb));
                    dirLen = dirLen - 1;
                }
                cb(files);
            }
        },
        makeStatCB = function (thing, len) {
            return function (err, stats) {
                if (err !== null) {
                    console.error(err);
                }
                if (stats.isFile()) {
                    files.push(path + thing);
                } else if (stats.isDirectory()) {
                    dirs.push(path + thing + '/');
                } else {
                    others.push(path + thing);
                }
                directoryDone(len);
            };
        };

    fs.readdir(path, function (err, things) {
        if (err !== null) {
            console.error(err);
        }
        var l = things.length, thing;
        if (l === 0) {
            directoryDone(l);
        }
        while (l > 0) {
            thing = things[l - 1];
            fs.stat(path + thing, makeStatCB(thing, l));
            l = l - 1;
        }
    });
};

readDir(startPath, fileChannelWrap(dirReadDone));
