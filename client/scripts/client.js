


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

    let status = document.getElementById('status-icon')

    let parseButton = document.getElementById('parse')
    parseButton.style.display = 'none'

    status.className = "loader" // Display loading feature

     try {
        const response = await fetch('/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({pdf_id: pdf_id})
        });

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

function updateHiddenInput() {
    const checkbox = document.getElementById('subscribedCheckbox');
    const hiddenInput = document.getElementById('checkBoxValue');
    
    // Set the value of the hidden input based on the checkbox's 'checked' state
    if (checkbox.checked) {
        hiddenInput.value = "true";
    } else {
        hiddenInput.value = "false";
    }
}

function renderCourseStatusAction(actionContainer, course) {
    if (!actionContainer || !course) return;

    if (!course.summaryStatus || course.summaryStatus === 'completed') {
        actionContainer.innerHTML = `<a class="btn-secondary" href="/data?courseId=${course._id}">Show Summary</a>`;
        return;
    }

    if (course.summaryStatus === 'failed') {
                actionContainer.innerHTML = `
                    <form action="/courses/retry-summary" method="post">
                        <input type="hidden" name="courseId" value="${course._id}">
                        <button class="btn-secondary" type="submit">Retry Summary</button>
                    </form>
                `;
        return;
    }

    actionContainer.innerHTML = '<div class="status-loading"><span class="loader"></span><span>Processing summary...</span></div>';
}

async function fetchCourseStatuses() {
    const response = await fetch('/courses/status');
    if (!response.ok) return null;
    return response.json();
}

function hasProcessingCourses(courseStatusItems) {
    return courseStatusItems.some((course) => course.summaryStatus === 'processing');
}

function applyCourseStatuses(courseStatusItems) {
    const rows = document.querySelectorAll('.course-status-item[data-course-id]');
    const statusMap = new Map(courseStatusItems.map((course) => [String(course._id), course]));

    rows.forEach((row) => {
        const courseId = row.getAttribute('data-course-id');
        const actionContainer = row.querySelector('.course-status-action');
        const course = statusMap.get(String(courseId));
        if (course) {
            renderCourseStatusAction(actionContainer, course);
        }
    });
}

function startCourseStatusPolling() {
    const courseList = document.getElementById('course-status-list');
    if (!courseList) return;

    let intervalId = null;

    const poll = async () => {
        try {
            const payload = await fetchCourseStatuses();
            if (!payload || !payload.courses) return;

            applyCourseStatuses(payload.courses);

            if (!hasProcessingCourses(payload.courses)) {
                clearInterval(intervalId);
            }
        } catch (error) {
            console.error('Failed to poll course statuses', error);
        }
    };

    poll();
    intervalId = setInterval(poll, 3000);
}
