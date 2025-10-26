// --- Global Data and Utility Functions ---
const TODAY_DATE = new Date().toLocaleDateString();
document.getElementById('date-display').textContent = `Today's Date: ${TODAY_DATE}`;

// Initialize student list or load from storage
let students = loadStudents();
let attendanceData = {}; // Attendance for the current day

// Utility to get a permanent storage key for a list
function getStudentListKey() {
    return 'permanent_student_list';
}

// Utility to get a daily storage key for attendance
function getAttendanceKey(date = TODAY_DATE) {
    return `attendance_${date.replace(/\//g, '-')}`;
}

// --- Local Storage Management ---

function loadStudents() {
    const savedStudents = localStorage.getItem(getStudentListKey());
    if (savedStudents) {
        return JSON.parse(savedStudents);
    }
    // Default list if nothing is saved yet
    return [
        { id: 101, name: "Alice Johnson" },
        { id: 102, name: "Bob Smith" },
        { id: 103, name: "Charlie Brown" }
    ];
}

function saveStudents() {
    localStorage.setItem(getStudentListKey(), JSON.stringify(students));
    populateRemoveDropdown(); // Update the dropdown whenever the list changes
}

function loadAttendance() {
    const savedData = localStorage.getItem(getAttendanceKey());
    if (savedData) {
        attendanceData = JSON.parse(savedData);
    } else {
        // Initialize all current students as 'Absent' if no data for today
        students.forEach(student => {
            attendanceData[student.id] = 'Absent';
        });
    }
}

// --- Rendering Functions ---

// Renders the main daily attendance table
function renderTable() {
    const listElement = document.getElementById('student-list');
    listElement.innerHTML = ''; 

    students.forEach(student => {
        const row = listElement.insertRow();
        const nameCell = row.insertCell();
        const statusCell = row.insertCell();

        nameCell.textContent = student.name;
        
        const currentStatus = attendanceData[student.id] || 'Absent'; // Default to Absent if missing
        const button = document.createElement('button');
        button.className = 'status-button';
        button.id = `btn-${student.id}`;
        
        updateButton(button, currentStatus);

        // Toggle Status Logic
        button.onclick = () => {
            const newStatus = (attendanceData[student.id] === 'Present') ? 'Absent' : 'Present';
            attendanceData[student.id] = newStatus;
            updateButton(button, newStatus);
        };

        statusCell.appendChild(button);
    });
}

function updateButton(button, status) {
    button.textContent = status;
    button.className = 'status-button ' + status.toLowerCase();
}

// Populates the dropdown menu for removing students
function populateRemoveDropdown() {
    const select = document.getElementById('student-to-remove');
    select.innerHTML = '<option value="">-- Select Student --</option>';
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = student.name;
        select.appendChild(option);
    });
}

// --- Student Management Handlers ---

document.getElementById('add-student-button').onclick = function() {
    const input = document.getElementById('new-student-name');
    const newName = input.value.trim();
    if (newName) {
        // Simple unique ID generation (timestamp)
        const newId = Date.now(); 
        students.push({ id: newId, name: newName });
        saveStudents();
        renderTable(); // Re-render the main table
        input.value = '';
    } else {
        alert("Please enter a student name.");
    }
};

document.getElementById('remove-student-button').onclick = function() {
    const select = document.getElementById('student-to-remove');
    const studentIdToRemove = parseInt(select.value);

    if (studentIdToRemove) {
        const confirmRemove = confirm("Are you sure you want to remove this student? This cannot be undone.");
        if (confirmRemove) {
            students = students.filter(student => student.id !== studentIdToRemove);
            saveStudents();
            renderTable(); // Re-render everything
            select.value = ''; // Reset dropdown
        }
    } else {
        alert("Please select a student to remove.");
    }
};

// --- Attendance Saving Handler ---

document.getElementById('save-button').onclick = function() {
    const storageKey = getAttendanceKey(TODAY_DATE);
    
    try {
        localStorage.setItem(storageKey, JSON.stringify(attendanceData));
        document.getElementById('status-message').textContent = `Attendance for ${TODAY_DATE} saved successfully!`;
        document.getElementById('status-message').style.color = 'green';
        
        // After saving today, refresh the history view
        renderHistory();
    } catch (e) {
        document.getElementById('status-message').textContent = `Error saving attendance: ${e.message}`;
        document.getElementById('status-message').style.color = 'red';
    }
    
    setTimeout(() => document.getElementById('status-message').textContent = '', 3000);
};


// --- History View Functions ---

function renderHistory() {
    const historyContainer = document.getElementById('history-container');
    historyContainer.innerHTML = '';
    
    let historyTableHTML = '<table><thead><tr><th>Date</th>';

    // 1. Get the list of all permanent students for table headers
    students.forEach(s => {
        historyTableHTML += `<th>${s.name.split(' ')[0]}</th>`; // Use first name for compactness
    });
    historyTableHTML += '</tr></thead><tbody>';

    let hasHistory = false;

    // 2. Iterate through all items in Local Storage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Look for keys that start with our attendance prefix
        if (key && key.startsWith('attendance_')) {
            hasHistory = true;
            const dateString = key.replace('attendance_', '').replace(/-/g, '/');
            const dailyRecord = JSON.parse(localStorage.getItem(key));

            // Start a new row for the date
            historyTableHTML += `<tr><td>${dateString}</td>`;

            // 3. Fill in attendance status for each student
            students.forEach(student => {
                const status = dailyRecord[student.id] || '-'; // '-' if student wasn't tracked that day
                const statusClass = status === 'Present' ? 'history-present' : status === 'Absent' ? 'history-absent' : '';
                historyTableHTML += `<td class="${statusClass}">${status[0]}</td>`; // Use P or A
            });
            historyTableHTML += '</tr>';
        }
    }

    historyTableHTML += '</tbody></table>';

    if (hasHistory) {
        historyContainer.innerHTML = historyTableHTML;
    } else {
        historyContainer.innerHTML = '<p>No past attendance records found yet.</p>';
    }
}

// --- Initial Setup Execution ---
loadStudents();
loadAttendance();
populateRemoveDropdown();
renderTable();
renderHistory(); // Load history when the page loads