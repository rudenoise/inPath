var fs = require('fs');
var allFiles = [];

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


function dirCB(files) {
    'use strict';
    // args: path, files, dirs, others
    //console.log('startPath: ', path);
    //console.log('files: ', files.length);
    allFiles = allFiles.concat(files);
    //console.log('dirs: ', dirs);
    //console.log('others: ', others);
    //console.log('...............................');
}

var readDir = function (path, cb) {
    'use strict';
    var files = [],
        dirs = [],
        others = [],
        end  = function (len) {
            var dirLen = dirs.length;
            if (len <= 1) {
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
                end(len);
            };
        };

    fs.readdir(path, function (err, things) {
        if (err !== null) {
            console.error(err);
        }
        var l = things.length, thing;
        if (l === 0) {
            end(l);
        }
        while (l > 0) {
            thing = things[l - 1];
            fs.stat(path + thing, makeStatCB(thing, l));
            l = l - 1;
        }
    });
};

var startPath = process.argv[process.argv.length - 1];

readDir(startPath, fileChannelWrap(dirCB));
