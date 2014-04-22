function help() {
    'use strict';
    process.stdout.write(
        '\ninPath v0.0.1 https://github.com/rudenoise/inPath\n'
    );
    process.stdout.write(
        '\n\tUSAGE: node inPath.js [regEx filter] <path>\n'
    );
    process.stdout.write(
        '\tOR: <stdout stream> | node inPath.js [regEx filter]\n\n'
    );
    process.stdout.write(
        '\tHELP: node inPath.js -h\n\n'
    );
    return process.exit(0);
}

function writeResults(filePaths, regExp) {
    'use strict';
    var l = filePaths.length - 1, p = 0;
    while (p <= l) {
        if (!regExp || regExp.test(filePaths[p])) {
            process.stdout.write(filePaths[p] + '\n');
        }
        p = p + 1;
    }
}

function createReadDirectoryCallBack(regExp) {
    'use strict';
    return function (err, filePaths) {
        if (err !== null) {
            console.error(err);
            return process.exit(1);
        }
        writeResults(filePaths, regExp);
        return process.exit(0);
    };
}

module.exports = {
    help: help,
    writeResults: writeResults,
    createReadDirectoryCallBack: createReadDirectoryCallBack
};
