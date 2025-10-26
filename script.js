// 1. Initial Data Setup
const students = [
    { id: 1, name: "Alice Johnson" },
    { id: 2, name: "Bob Smith" },
    { id: 3, name: "Charlie Brown" },
    { id: 4, name: "Diana Prince" }
];

const today = new Date().toLocaleDateString();
document.getElementById('date-display').textContent = `Date: ${today}`;

// Object to hold the attendance for the current session
let attendanceData = {};

// 2. Load Attendance from Local Storage
function loadAttendance() {
    // Key to look for attendance for today's date
    const storageKey = `attendance_${today.replace(/\//g, '-')}`; 
    const savedData = localStorage.getItem(storageKey);
    
    if (savedData) {
        attendanceData = JSON.parse(savedData);
    } else {
        // Initialize as absent if no data exists
        students.forEach(student => {
            attendanceData[student.id] = 'Absent';
        });
    }
}

// 3. Render the Table on the Page
function renderTable() {
    const listElement = document.getElementById('student-list');
    listElement.innerHTML = ''; // Clear existing list

    students.forEach(student => {
        const row = listElement.insertRow();
        const nameCell = row.insertCell();
        const statusCell = row.insertCell();

        nameCell.textContent = student.name;
        
        const currentStatus = attendanceData[student.id];
        const button = document.createElement('button');
        button.className = 'status-button';
        button.id = `btn-${student.id}`;
        
        updateButton(button, currentStatus);

        // Function to toggle status
        button.onclick = () => {
            const newStatus = (attendanceData[student.id] === 'Present') ? 'Absent' : 'Present';
            attendanceData[student.id] = newStatus;
            updateButton(button, newStatus);
        };

        statusCell.appendChild(button);
    });
}

// Helper function to set button style and text
function updateButton(button, status) {
    button.textContent = status;
    button.className = 'status-button ' + status.toLowerCase(); // 'present' or 'absent'
}


// 4. Save Attendance Function
document.getElementById('save-button').onclick = function() {
    const storageKey = `attendance_${today.replace(/\//g, '-')}`;
    
    try {
        localStorage.setItem(storageKey, JSON.stringify(attendanceData));
        document.getElementById('status-message').textContent = `Attendance for ${today} saved successfully!`;
        document.getElementById('status-message').style.color = 'green';
    } catch (e) {
        document.getElementById('status-message').textContent = `Error saving attendance: ${e.message}`;
        document.getElementById('status-message').style.color = 'red';
    }
    
    setTimeout(() => document.getElementById('status-message').textContent = '', 3000); // Clear message after 3 seconds
};

// 5. Initialisation
loadAttendance();
renderTable();