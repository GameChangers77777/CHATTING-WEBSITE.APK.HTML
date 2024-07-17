let localStream;
let remoteStream;
let peerConnection;
const chatBox = document.getElementById('chat');
const messageInput = document.getElementById('message');
const statusInput = document.getElementById('statusInput');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const statusBox = document.getElementById('status');
const fileInput = document.getElementById('fileInput');
const installBtn = document.getElementById('installBtn');
const chatSearch = document.getElementById('chatSearch');
const notificationToggle = document.getElementById('notificationToggle');

const servers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').then(() => {
        installBtn.style.display = 'block';
        installBtn.onclick = installApp;
    });
}

window.onload = () => {
    loadChatHistory();
    loadStatus();
};

async function loadChatHistory() {
    const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    messages.forEach(msg => appendMessage(msg));
}

async function loadStatus() {
    const status = localStorage.getItem('userStatus');
    if (status) {
        setStatusDisplay(status);
    }
}

function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;

    if (notificationToggle.checked) {
        new Notification('New Message', { body: message });
    }
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        appendMessage(`You: ${message}`);
        saveMessage(message);
        messageInput.value = '';
    }
}

function saveMessage(message) {
    const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    messages.push(message);
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

function setStatus() {
    const status = statusInput.value.trim();
    if (status) {
        localStorage.setItem('userStatus', status);
        setStatusDisplay(status);
        statusInput.value = '';
        setTimeout(clearStatus, 60000);
    }
}

function setStatusDisplay(status) {
    statusBox.textContent = `Status: ${status}`;
}

function clearStatus() {
    localStorage.removeItem('userStatus');
    statusBox.textContent = '';
}

function sendFile() {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            appendMessage(`You sent a file: ${file.name}`);
            saveMessage(`File sent: ${file.name}`);
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
    }
}

function searchMessages() {
    const searchTerm = chatSearch.value.toLowerCase();
    const messages = document.querySelectorAll('#chat div');
    messages.forEach(message => {
        if (message.textContent.toLowerCase().includes(searchTerm)) {
            message.style.display = 'block';
        } else {
            message.style.display = 'none';
        }
    });
}

async function startCall() {
    await initMedia();
    peerConnection = new RTCPeerConnection(servers);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            console.log('New ICE candidate: ', event.candidate);
        }
    };

    peerConnection.ontrack = event => {
        remoteStream = event.streams[0];
        remoteVideo.srcObject = remoteStream;
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log('Offer: ', offer);
}

async function startVoiceCall() {
    await initMedia();
    peerConnection = new RTCPeerConnection(servers);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            console.log('New ICE candidate: ', event.candidate);
        }
    };

    peerConnection.ontrack = event => {
        remoteStream = event.streams[0];
        remoteVideo.srcObject = remoteStream;
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log('Voice Offer: ', offer);
}

async function initMedia() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
    localVideo.style.display = 'block';
    remoteVideo.style.display = 'block';
}

function installApp() {
    const a = document.createElement('a');
    a.href = 'your-app.apk'; // Link to your APK
    a.download = 'Boys_Brigade.apk';
    a.click();
}

function toggleNotifications() {
    if (notificationToggle.checked) {
        Notification.requestPermission();
    }
}
