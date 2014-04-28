var args = process.argv.slice(2),
    readDirectory = require('./readDirectory.js'),
    cli = require('./cli.js'),
    help = cli.help,
    writeResults = cli.writeResults,
    createReadDirectoryCallBack = cli.createReadDirectoryCallBack;


if (args.length === 0) {
    // was called by
    // > node inPath.js
    help();
}

if (args.length === 1) {
    if (args[0] === '-h') {
    // node inPath.js -h
        help();
    } else {
        // node inPath.js <.path>
        readDirectory(args[0], createReadDirectoryCallBack());
    }
}

if (args.length === 2) {
    // node inPath.js [regExp] <.path>
    readDirectory(
        args[1],
        createReadDirectoryCallBack(new RegExp(args[0]))
    );
}

/*
loom into piped input...
process.stdin.on('readable', function(chunk) {
    var chunk = process.stdin.read();
    if (chunk !== null) {
        process.stdout.write('data: ' + chunk);
    }
});

process.stdin.on('end', function () {
    console.log('ended');
});

*/
