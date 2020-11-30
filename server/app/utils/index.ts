const fs = require('fs');

function delay(time: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

function writeData2File(filepath: string , data: Array<any> | object) {
    fs.writeFile(filepath, JSON.stringify(data), (err) => {
        if (err) throw err;
    })
}

function readDataFromFile(filepath: string) {
    return JSON.parse(fs.readFileSync(filepath) || '');
}

module.exports = {
    delay,
    writeData2File,
    readDataFromFile
}