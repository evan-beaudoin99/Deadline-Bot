const path = require('path')

const { spawn } = require('child_process');

const SUMMARY_TIMEOUT_MS = 3 * 60 * 1000;
const PROJECT_ROOT = path.join(__dirname, '..');

function parseSummaryOutput(output) {
    const lines = output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    for (let index = lines.length - 1; index >= 0; index -= 1) {
        try {
            const parsed = JSON.parse(lines[index]);

            if (parsed && parsed.success === true && parsed.summary) {
                return parsed.summary;
            }

            if (parsed && parsed.dates) {
                return parsed;
            }
        } catch (error) {
            continue;
        }
    }

    throw new Error(`Python summarize output was not valid JSON. Output: ${output || '(empty output)'}`);
}


function email(userId) {

    const args = [path.join(__dirname, '../emailer/email_sender.py'), userId];

    const pythonProcess = spawn('python', args, { cwd: PROJECT_ROOT });

    pythonProcess.stdout.on('data', () => {})

    pythonProcess.stderr.on('data', (data) => {
        console.error( `stderr: ${data}`)
    })

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Email process exited with code ${code}`)
        }
    })

}

function summarize(emailInfo) {

    return new Promise((resolve, reject) => {
        const args = ['-u', path.join(__dirname, '../emailer/main.py'), JSON.stringify(emailInfo)];

        const pythonProcess = spawn('python', args, { cwd: PROJECT_ROOT });

        let scriptOutput = ""
        let stderrData = ""
        let settled = false

        const timeout = setTimeout(() => {
            if (settled) {
                return;
            }

            settled = true;
            pythonProcess.kill();
            reject(new Error(`Summary processing timed out after ${SUMMARY_TIMEOUT_MS}ms.`));
        }, SUMMARY_TIMEOUT_MS);

        pythonProcess.stdout.on('data', (data) => {
            scriptOutput += data.toString()
        })

        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString()
        })

        pythonProcess.on('close', (code) => {
            clearTimeout(timeout);

            if (settled) {
                return;
            }

            settled = true;

            if (code === 0) {
                try {
                    const summary = parseSummaryOutput(scriptOutput);
                    resolve(summary);
                } catch (parseError) {
                    reject(parseError);
                }
            }
            else {
                reject(new Error(stderrData || `Process exited with code ${code}`))
            }
        })

        pythonProcess.on('error', (err) => {
            clearTimeout(timeout);

            if (settled) {
                return;
            }

            settled = true;
            reject(err)
        })
    })

    
}

module.exports = {
    email,
    summarize
} 