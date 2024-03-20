const firebaseConfig = {
  apiKey: "AIzaSyAktHb6SLAb3ekcCWW1spg_lTM6PB3pi4I",
  authDomain: "studychat-dpu.firebaseapp.com",
  projectId: "studychat-dpu",
  storageBucket: "studychat-dpu.appspot.com",
  messagingSenderId: "8208143906",
  appId: "1:8208143906:web:04adfcfc374f53fc9e9c7b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let sender = sessionStorage.getItem('sender');
if (!sender) {
    sender = prompt('Please enter your name');
    sessionStorage.setItem('sender', sender);
}

// Function to send a message
document.getElementById('msgBtn').addEventListener('click', () => {
    const msgTxt = document.getElementById('msgTxt');
    const msg = msgTxt.value.trim();
    if (msg === '') {
        alert('Please enter a message.');
        return;
    }
    const timestamp = new Date().getTime();
    db.ref("messages/" + timestamp).set({
        msg: msg,
        sender: sender
    }).then(() => {
        // Clear input after successful send
        msgTxt.value = "";
    }).catch(error => {
        console.error("Error sending message:", error);
        alert('Failed to send message. Please try again later.');
    });
});

// Firebase listener for new messages
db.ref("messages").on("child_added", function (snapshot) {
    const data = snapshot.val();
    const key = snapshot.key;
    const messages = document.getElementById('messages');

    const messageDiv = document.createElement('div');
    messageDiv.id = key;

    if (data.sender === sender) {
        messageDiv.className = 'outer me';
        messageDiv.innerHTML = `<div class="alert alert-primary" role="alert">You: ${data.msg} <button onclick="deleteMessage('${key}')" class="btn btn-sm btn-danger">DELETE</button></div>`;
    } else {
        messageDiv.className = 'outer notMe';
        messageDiv.innerHTML = `<div class="alert alert-secondary" role="alert">${data.sender}: ${data.msg}</div>`;
    }

    messages.appendChild(messageDiv);

    // Scroll to the bottom
    messages.scrollTop = messages.scrollHeight;
});

// Firebase listener for message deletion
db.ref("messages").on("child_removed", function (snapshot) {
    const key = snapshot.key;
    const messageDiv = document.getElementById(key);
    if (messageDiv) {
        messageDiv.remove();
    }
});

// Function to delete a message
function deleteMessage(key) {
    if (confirm("Are you sure you want to delete this message?")) {
        db.ref("messages/" + key).remove().catch(error => {
            console.error("Error deleting message:", error);
            alert('Failed to delete message. Please try again later.');
        });
    }
}

// Function to delete all chats (only authorized user)
document.getElementById('deleteAllBtn').addEventListener('click', () => {
    const password = prompt('Enter password to delete all chats:');
    if (password === 'your_password_here') { // Replace 'your_password_here' with your actual password
        if (confirm("Are you sure you want to delete all chats?")) {
            db.ref("messages").remove().catch(error => {
                console.error("Error deleting chats:", error);
                alert('Failed to delete chats. Please try again later.');
            });
        }
    } else {
        alert('Invalid password. You are not authorized to delete chats.');
    }
});

// Function to create a group chat
document.getElementById('createGroupBtn').addEventListener('click', () => {
    const groupName = prompt('Enter group name:');
    if (groupName) {
        const groupKey = db.ref("groups").push().key;
        db.ref("groups/" + groupKey).set({
            name: groupName,
            createdBy: sender
        }).then(() => {
            const groupLink = window.location.href + '?group=' + groupKey;
            alert('Group created: ' + groupName + '\nGroup Link: ' + groupLink);
            document.getElementById('groupLinkBtn').style.display = 'block';
            document.getElementById('groupLinkBtn').href = groupLink;
        }).catch(error => {
            console.error("Error creating group:", error);
            alert('Failed to create group. Please try again later.');
        });
    }
});
  
