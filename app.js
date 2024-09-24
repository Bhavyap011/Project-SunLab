import { db } from './firebase-config.js';
import { doc, setDoc, collection, getDocs, query, where, orderBy, limit, Timestamp } from "https://www.gstatic.com/firebasejs/9.19.0/firebase-firestore.js";

// Load access logs from Firestore
function loadAccessLogs() {
    const accessLogsRef = collection(db, "AccessLogs");
    getDocs(accessLogsRef)
        .then((snapshot) => {
            const logsContainer = document.getElementById('access-logs');
            logsContainer.innerHTML = ''; // Clear existing logs

            if (snapshot.empty) {
                logsContainer.textContent = "No access logs available.";
                return;
            }

            // Store logs in a global variable for filtering later
            window.allAccessLogs = [];
            snapshot.forEach(doc => {
                const log = doc.data();
                window.allAccessLogs.push(log); // Save log data for filtering
                const logElement = document.createElement('div');
                logElement.textContent = `User ID: ${log.userID}, Type: ${log.userType}, Timestamp: ${log.timestamp.toDate().toLocaleString()}`;
                logsContainer.appendChild(logElement);
            });
        })
        .catch((error) => {
            console.error("Error loading access logs:", error);
        });
}

// Log access event (with check-in/check-out tracking)
document.getElementById('log-access-btn').addEventListener('click', () => {
    const userType = document.getElementById('user-type').value; // Get selected user type
    const userID = document.getElementById('student-id-input').value.trim(); // Trim to prevent errors
    const timestamp = Timestamp.now();

    if (userID) { // Check if user ID is provided
        const accessLogRef = collection(db, "AccessLogs");
        setDoc(doc(accessLogRef, `${userID}_${timestamp.seconds}`), { // Use a unique ID for each log
            userID: userID,
            userType: userType, // Store user type in Firestore
            timestamp: timestamp
        })
            .then(() => {
                // Track and update user activity (inside/outside)
                updateUserActivityStatus(userID, userType);
                alert(`Access logged for User ID: ${userID}, Type: ${userType}`);
                loadAccessLogs(); // Refresh logs
            })
            .catch((error) => {
                console.error("Error logging access:", error);
            });
    } else {
        alert("Please enter a User ID.");
    }
});

// Update user activity status (inside/outside)
function updateUserActivityStatus(userID, userType) {
    const accessLogsRef = collection(db, "AccessLogs");

    // Query the last access log for this user
    const userLogsQuery = query(accessLogsRef, where("userID", "==", userID), orderBy("timestamp", "desc"), limit(1));

    getDocs(userLogsQuery)
        .then((snapshot) => {
            let userStatus = "inside"; // Default status is inside for the first log

            // Determine the last action for the user
            snapshot.forEach(doc => {
                const log = doc.data();
                if (log.userID === userID) {
                    // Toggle status based on the last action
                    userStatus = log.userType === "inside" ? "outside" : "inside"; // If inside, change to outside, and vice versa
                }
            });

            // Log the action based on status
            logAccessEvent(userID, userStatus, userType);
        })
        .catch((error) => {
            console.error("Error updating user activity status:", error);
        });
}

// Log access event based on user status (inside/outside)
function logAccessEvent(userID, userStatus, userType) {
    const timestamp = Timestamp.now();
    const accessLogRef = collection(db, "AccessLogs");

    // Log entry or exit based on status
    setDoc(doc(accessLogRef, `${userID}_${timestamp.seconds}`), {
        userID: userID,
        userType: userStatus, // Save status as "inside" or "outside"
        timestamp: timestamp
    })
        .then(() => {
            alert(`User ID: ${userID} has ${userStatus === "inside" ? "entered" : "exited"} the lab.`);
            loadAccessLogs(); // Refresh logs
        })
        .catch((error) => {
            console.error("Error logging access event:", error);
        });
}

// Set user status in Firestore
function setUserStatus(userID, status) {
    const userRef = doc(db, "Users", userID);
    setDoc(userRef, { status }, { merge: true })
        .then(() => {
            alert(`User ${userID} status updated to ${status}.`);
        })
        .catch((error) => {
            console.error("Error updating user status:", error);
        });
}

// Filter access logs
document.getElementById('filter-btn').addEventListener('click', () => {
    const date = document.getElementById('filter-date').value;
    const userID = document.getElementById('filter-student-id').value.trim();
    const userType = document.getElementById('filter-user-type').value; // Get selected user type

    // Filter logs in memory instead of querying Firestore
    const filteredLogs = window.allAccessLogs.filter(log => {
        const logDate = log.timestamp.toDate().toISOString().split('T')[0]; // Get the date part of the timestamp
        const matchesDate = date ? logDate === date : true; // Check if the date matches
        const matchesUserID = userID ? log.userID === userID : true; // Check if the userID matches
        const matchesUserType = userType ? log.userType === userType : true; // Check if the userType matches

        return matchesDate && matchesUserID && matchesUserType; // Return true if all conditions are met
    });

    console.log("Filtered Logs:", filteredLogs); // Log filtered results for debugging

    // Display the filtered logs
    const logsContainer = document.getElementById('access-logs');
    logsContainer.innerHTML = ''; // Clear existing logs
    if (filteredLogs.length === 0) {
        logsContainer.textContent = "No access logs found for the specified criteria.";
        return;
    }
    filteredLogs.forEach(log => {
        const logElement = document.createElement('div');
        logElement.textContent = `User ID: ${log.userID}, Type: ${log.userType}, Timestamp: ${log.timestamp.toDate().toLocaleString()}`;
        logsContainer.appendChild(logElement);
    });
});

// Manage user status
document.getElementById('manage-status-btn').addEventListener('click', () => {
    const userID = document.getElementById('user-id').value.trim();
    const status = document.getElementById('user-status').value;
    if (userID) { // Check if user ID is provided
        setUserStatus(userID, status);
    } else {
        alert("Please enter a User ID to manage status.");
    }
});

// Load access logs on initial load
loadAccessLogs();