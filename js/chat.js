// js/chat.js - Chat Page Functionality

let socket = null;
let localStream = null;
let peerConnections = {};
let currentRoom = null;
let isVideoEnabled = true;
let isAudioEnabled = true;

// Initialize chat functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!utils.isLoggedIn()) {
        // Show login modal instead of redirecting
        requestChatAccess();
        return;
    }

    initializeSocket();
    loadRooms();
    setupMediaDevices();
});

// Initialize WebSocket connection
function initializeSocket() {
    socket = io(WS_URL, {
        auth: {
            token: utils.getToken()
        }
    });

    socket.on('connect', () => {
        console.log('Connected to chat server');
    });

    socket.on('user-joined', (data) => {
        addSystemMessage(`${data.username} joined the room`);
    });

    socket.on('user-left', (data) => {
        addSystemMessage(`${data.username} left the room`);
        // Remove video element if exists
        const videoElement = document.getElementById(`video-${data.userId}`);
        if (videoElement) {
            videoElement.remove();
        }
    });

    socket.on('new-message', (data) => {
        addChatMessage(data);
    });

    socket.on('room-info', (data) => {
        updateRoomInfo(data);
    });

    socket.on('user-kicked', (data) => {
        const user = utils.getUser();
        if (data.userId === user.id) {
            alert('You have been removed from the room');
            leaveRoom();
        } else {
            addSystemMessage(`User was removed by ${data.kickedBy}`);
        }
    });

    socket.on('error', (error) => {
        utils.showNotification(error, 'error');
    });
}

// Setup media devices
async function setupMediaDevices() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = localStream;
        }
    } catch (error) {
        console.error('Error accessing media devices:', error);
        // Don't show error notification if user denies permission
        if (error.name !== 'NotAllowedError') {
            utils.showNotification('Unable to access camera/microphone', 'error');
        }
    }
}

// Load available rooms
async function loadRooms() {
    try {
        const rooms = await utils.apiRequest('/rooms');
        const roomsList = document.getElementById('roomsList');
        
        // Check if element exists
        if (!roomsList) {
            console.warn('roomsList element not found');
            return;
        }
        
        roomsList.innerHTML = '';
        
        if (!rooms || rooms.length === 0) {
            roomsList.innerHTML = '<div class="no-rooms">No active rooms. Create one!</div>';
            return;
        }
        
        rooms.forEach(room => {
            const roomItem = document.createElement('div');
            roomItem.className = 'room-item';
            roomItem.innerHTML = `
                <div class="room-name">${room.room_name}</div>
                <div class="room-info-text">
                    <span>${room.user_count || 0}/${room.max_users} users</span>
                    <span>${room.is_private ? 'Private' : 'Public'}</span>
                </div>
            `;
            roomItem.onclick = () => joinRoom(room.room_code);
            roomsList.appendChild(roomItem);
        });
    } catch (error) {
        console.error('Error loading rooms:', error);
        const roomsList = document.getElementById('roomsList');
        if (roomsList) {
            roomsList.innerHTML = '<div class="error-message">Unable to load rooms</div>';
        }
    }
}

// Create a new room
async function createRoom() {
    const roomNameInput = document.getElementById('newRoomName');
    const privateRoomInput = document.getElementById('privateRoom');
    const maxUsersInput = document.getElementById('maxUsers');
    
    if (!roomNameInput) {
        console.error('Room name input not found');
        return;
    }
    
    const roomName = roomNameInput.value.trim();
    const isPrivate = privateRoomInput ? privateRoomInput.checked : false;
    const maxUsers = maxUsersInput ? maxUsersInput.value : 50;
    
    if (!roomName) {
        utils.showNotification('Please enter a room name', 'error');
        return;
    }
    
    try {
        const room = await utils.apiRequest('/rooms', {
            method: 'POST',
            body: JSON.stringify({
                roomName,
                isPrivate,
                maxUsers: parseInt(maxUsers)
            })
        });
        
        utils.showNotification('Room created successfully!', 'success');
        roomNameInput.value = '';
        loadRooms();
        joinRoom(room.room_code);
    } catch (error) {
        utils.showNotification('Failed to create room', 'error');
        console.error('Error creating room:', error);
    }
}

// Join a room
function joinRoom(roomCode) {
    if (currentRoom) {
        leaveRoom();
    }
    
    socket.emit('join-room', roomCode);
    currentRoom = roomCode;
    
    const roomCodeElement = document.getElementById('roomCode');
    if (roomCodeElement) {
        roomCodeElement.textContent = `Code: ${roomCode}`;
    }
    
    // Mark room as active
    document.querySelectorAll('.room-item').forEach(item => {
        item.classList.remove('active');
        const roomNameElement = item.querySelector('.room-name');
        if (roomNameElement && roomNameElement.textContent.includes(roomCode)) {
            item.classList.add('active');
        }
    });
    
    utils.showNotification(`Joined room: ${roomCode}`, 'success');
}

// Leave current room
function leaveRoom() {
    if (currentRoom) {
        socket.emit('leave-room', currentRoom);
        currentRoom = null;
        
        // Clear video grid except local video
        const videoGrid = document.getElementById('videoGrid');
        if (videoGrid) {
            const videos = videoGrid.querySelectorAll('.video-container:not(#localVideoContainer)');
            videos.forEach(video => video.remove());
        }
        
        // Clear chat
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '<div class="message system"><span>Left the room</span></div>';
        }
        
        // Update UI
        const roomNameElement = document.getElementById('roomName');
        const roomCodeElement = document.getElementById('roomCode');
        if (roomNameElement) roomNameElement.textContent = 'Select a Room';
        if (roomCodeElement) roomCodeElement.textContent = '';
    }
}

// Toggle video
function toggleVideo() {
    isVideoEnabled = !isVideoEnabled;
    
    if (localStream) {
        localStream.getVideoTracks().forEach(track => {
            track.enabled = isVideoEnabled;
        });
    }
    
    const btn = document.getElementById('videoToggle');
    if (btn) {
        btn.classList.toggle('active', isVideoEnabled);
        btn.innerHTML = isVideoEnabled ? '<i class="fas fa-video"></i>' : '<i class="fas fa-video-slash"></i>';
    }
}

// Toggle audio
function toggleAudio() {
    isAudioEnabled = !isAudioEnabled;
    
    if (localStream) {
        localStream.getAudioTracks().forEach(track => {
            track.enabled = isAudioEnabled;
        });
    }
    
    const btn = document.getElementById('audioToggle');
    if (btn) {
        btn.classList.toggle('active', isAudioEnabled);
        btn.innerHTML = isAudioEnabled ? '<i class="fas fa-microphone"></i>' : '<i class="fas fa-microphone-slash"></i>';
    }
}

// Share screen
async function shareScreen() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
        });
        
        const videoTrack = screenStream.getVideoTracks()[0];
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = screenStream;
        }
        
        // When screen share ends, switch back to camera
        videoTrack.onended = () => {
            if (localVideo && localStream) {
                localVideo.srcObject = localStream;
            }
        };
        
        utils.showNotification('Screen sharing started', 'success');
    } catch (error) {
        if (error.name === 'NotAllowedError') {
            console.log('User denied screen sharing permission');
        } else {
            console.error('Error sharing screen:', error);
            utils.showNotification('Unable to share screen', 'error');
        }
    }
}

// Send chat message
function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    
    if (message && currentRoom) {
        socket.emit('send-message', { message });
        input.value = '';
    } else if (message && !currentRoom) {
        utils.showNotification('Please join a room first', 'info');
    }
}

// Handle chat input
function handleChatInput(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Add chat message
function addChatMessage(data) {
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    
    const time = new Date(data.timestamp).toLocaleTimeString();
    messageDiv.innerHTML = `
        <span class="username">${utils.escapeHtml(data.username)}:</span>
        <span class="text">${utils.escapeHtml(data.message)}</span>
        <span class="timestamp">${time}</span>
    `;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Add system message
function addSystemMessage(message) {
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.innerHTML = `<span>${message}</span>`;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Update room info
function updateRoomInfo(data) {
    const roomNameElement = document.getElementById('roomName');
    if (roomNameElement) {
        roomNameElement.textContent = data.room.room_name;
    }
    
    // Update participants list
    const participantsList = document.getElementById('participantsList');
    if (!participantsList) return;
    
    participantsList.innerHTML = '';
    
    data.participants.forEach(participant => {
        const item = document.createElement('div');
        item.className = 'participant-item';
        
        const isHost = participant.id === data.room.host_id;
        const user = utils.getUser();
        const isMe = participant.id === user.id;
        
        item.innerHTML = `
            <div class="participant-info">
                <span class="participant-name">${participant.username}</span>
                ${isHost ? '<span class="participant-badge">Host</span>' : ''}
                ${isMe ? '<span class="participant-badge">You</span>' : ''}
            </div>
            ${isHost || user.isAdmin ? `
                <div class="participant-actions">
                    ${!isMe ? `<button class="participant-action" onclick="showHostControls('${participant.id}', '${participant.username}')">Manage</button>` : ''}
                </div>
            ` : ''}
        `;
        
        participantsList.appendChild(item);
    });
}

// Show host controls
function showHostControls(userId, username) {
    const targetUsernameElement = document.getElementById('targetUsername');
    const modal = document.getElementById('hostControlsModal');
    
    if (targetUsernameElement) {
        targetUsernameElement.textContent = username;
    }
    
    if (modal) {
        modal.style.display = 'flex';
    }
    
    window.targetUserId = userId;
}

// Close host controls
function closeHostControls() {
    const modal = document.getElementById('hostControlsModal');
    if (modal) {
        modal.style.display = 'none';
    }
    window.targetUserId = null;
}

// Kick user
function kickUser(ban) {
    const reasonInput = document.getElementById('kickReason');
    const reason = reasonInput ? reasonInput.value : '';
    
    socket.emit('kick-user', {
        userId: window.targetUserId,
        ban: ban,
        reason: reason
    });
    
    closeHostControls();
    utils.showNotification(`User ${ban ? 'banned' : 'kicked'} from room`, 'success');
}

// Add CSS for missing elements
const style = document.createElement('style');
style.textContent = `
    .no-rooms, .error-message {
        text-align: center;
        padding: 2rem;
        color: #888;
        font-style: italic;
    }
    
    .error-message {
        color: #DC143C;
    }
`;
document.head.appendChild(style);