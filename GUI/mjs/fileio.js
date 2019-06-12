// fs for file I/O
const fs = require('fs');

// For path normalization
const path = require('path');

// For appdata
const app = require('electron').app;

// Get digest script
const pScript = require('./pscript').script;

// Get platform
const process = require('process');
const platform = process.platform;

// Desperate attempt at making contract data update work
require.extensions['.txt'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var cData = require('./contract_data.txt');

class FileIO {
    constructor() {
        // Appdata path
        this.path = app.getPath('userData') + path.normalize('/Script/');
    
        // Contract data path
        this.cDataPath = this.path + 'contract_data.txt';

        // Python script path
        this.scriptFilePath = this.path + 'digest.py';
    }

    setup() {
        // Get contract data
        // const cData = this.readData(path.resolve('./contract_data.txt'));

        // Create script and contract data files if empty
        if (!fs.existsSync(this.path)) {
            fs.mkdirSync(this.path);
            this.writeData(pScript, this.scriptFilePath);
            this.writeData(cData, this.cDataPath);
        }
    }

    // Synchronously, though technically asynchronously write data (messed up)
    // Return 0 for success, 1 for failure (go *nix)
    writeData(data, path) {
        fs.writeFile(path, data, err => {
            if (err) return 1;
        });
        return 0;
    }

    // Read data with error catch
    readData(path) {
        let data;
        try {
            data = fs.readFileSync(path);
        } catch (_) {
            data = '{}';
        }
        return data;
    }
}

module.exports = FileIO;
