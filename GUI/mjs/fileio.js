// fs for file I/O
const fs = require('fs');

// For path normalization
const path = require('path');

// For appdata
const app = require('electron').app;

// Get install updates script
const pScript = require('./pscript').script;

// Get platform
const process = require('process');
const platform = process.platform;

class FileIO {
    constructor() {
        // Appdata path
        this.path = app.getPath('userData') + path.normalize('/Script/');
    
        // Python script path
        this.scriptFilePath = this.path + 'digest.py';

        // Contract data path
        this.cDataPath = this.path + 'contract_data.txt';

        // Install updates script path
        this.installScriptPath = this.path + 'install_package.py';

        // Whether configuration is set
        this.configSet = false;
        if (
            fs.existsSync(this.path) &&
            fs.existsSync(this.cDataPath) &&
            fs.existsSync(this.scriptFilePath)
        ) {
            this.configSet = true;
        }
    }

    pathExists(path) {
        return fs.existsSync(path);
    }

    setup() {
        if (!this.pathExists(this.installScriptPath)) {
            if (!this.pathExists(this.path)) {
                if (!this.pathExists(app.getPath('userData'))) {
                    fs.mkdirSync(app.getPath('userData'));
                }
                fs.mkdirSync(this.path);
            }
            this.writeData(pScript, this.installScriptPath);
        }
    }

    // Write data
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
