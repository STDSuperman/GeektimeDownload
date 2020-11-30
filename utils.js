const fs = require('fs');

function delay(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

function writeData2File(filename ,data) {
    fs.writeFile(filename, JSON.stringify(data), (err) => {
        if (err) throw err;
    })
}

function readDataFromFile(filename) {
    return JSON.parse(fs.readFileSync(filename) || '');
}

module.exports = {
    delay,
    writeData2File,
    readDataFromFile
}