const path = require('path')

const { spawn } = require('child_process');


function email(id) {

    const args = [path.join(__dirname, '../emailer/emailer.py'), id];

    const pythonProcess = spawn('python', args);

    let scriptOutput = ''

    pythonProcess.stdout.on('data', (data) => {
        console.log('Pipe data from python script ...')
        scriptOutput += data.toString();
    })

    pythonProcess.stderr.on('data', (data) => {
        console.error( `stderr: ${data}`)
    })

    pythonProcess.on('close', (code) => {
        console.log(`Child process closed with code ${code}`)
        console.log('Python script output', scriptOutput)
    })

}

function summarize(emailInfo) {

    return new Promise((resolve, reject) => {
        const args = [path.join(__dirname, '../emailer/main.py'), JSON.stringify(emailInfo)];

        const pythonProcess = spawn('python', args);

        let scriptOutput = ""
        let stderrData = ""

        pythonProcess.stdout.on('data', (data) => {
            console.log('Pipe data from python script ...')
            scriptOutput += data.toString()
        })

        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString()
        })

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(scriptOutput)
            }
            else {
                reject(new Error(stderrData || `Process exited with code ${code}`))
            }
        })

        pythonProcess.on('error', (err) => {
            reject(err)
        })
    })

    
}

function signalDone() {
    return true
}

module.exports = {
    email,
    summarize
} 