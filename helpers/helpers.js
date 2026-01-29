const python = require('./executePython')


function summarizePdfRequest(userId, pdfId) {
    const pdf_id = pdfId

    const emailInfo = {
        user_id: userId,
        pdf_id: pdfId
    }
    python.summarize(emailInfo)
}


module.exports = {
    summarizePdfRequest
}