


async function handleRemove(event, userId, pdfId) {
    event.preventDefault();

    if (!confirm('Are you sure you want to remove this PDF?')) return;

    try {
        const response = await fetch('remove-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify( {userId, pdfId} )
        });
    
        if (response.ok) {
            event.target.closest('.pdf-element').remove() // remove the element from the DOM
        } else {
            alert('Failed to remove PDF.')
        }
    } catch (error) {
        console.error('Error: ', error)
    }
}

async function startProcess(event, pdf_id) {


    if (event) event.preventDefault();

    console.log(pdf_id)

    let status = document.getElementById('status-icon')

    let parseButton = document.getElementById('parse')
    parseButton.style.display = 'none'

    console.log("Process started...");
    status.className = "loader" // Display loading feature

     try {
        const response = await fetch('/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({pdf_id: pdf_id})
        });

        console.log(response)

        if (response.ok ) {
            alert('AI is done summarizing your syllabus')
            parseButton.style.display = 'block'
            status.classList.remove('loader')

        } else {
            alert('Failed to summarize syllabus')
        }
    } catch (error) {
        console.error('Error: ', error)
    }
}