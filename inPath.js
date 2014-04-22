var startPath = process.argv[process.argv.length - 1],
    readDirectory = require('readDirectory');

readDirectory(startPath, function (err, filePaths) {
    'use strict';
    if (err !== null) {
        console.error(err);
        return process.exit(1);
    
    }
    var l = filePaths.length - 1, p = 0;
    while (p <= l) {
        process.stdout.write(filePaths[p] + '\n');
        p = p + 1;
    }
    return process.exit(0);
});




