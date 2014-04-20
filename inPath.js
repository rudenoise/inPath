var startPath = process.argv[process.argv.length - 1],
    readDir = require('readDirectory').readDir,
    fileChannelWrap = require('readDirectory').fileChannelWrap,
    dirReadDone = require('readDirectory').dirReadDone;




readDir(startPath, fileChannelWrap(dirReadDone));
