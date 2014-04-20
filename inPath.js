var startPath = process.argv[process.argv.length - 1],
    readDirectory = require('readDirectory').readDirectory;

readDirectory(startPath, function (filePaths) {
    'use strict';
    var l = filePaths.length - 1, p = 0;
    while (p <= l) {
        process.stdout.write(filePaths[p] + '\n');
        p = p + 1;
    }
    process.exit(0);
});




