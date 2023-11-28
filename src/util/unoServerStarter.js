const { spawn } = require('child_process');

function startUnoserver() {
    const unoserverProcess = spawn('python', ['src/util/unoServer.py']);

    unoserverProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    unoserverProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    unoserverProcess.on('close', (code) => {
        console.log(`unoserver process exited with code ${code}`);
    });
}

module.exports = startUnoserver;