// Chat functionality with WebRTC support

let socket = null;
let localStream = null;
let peerConnections = {};
let currentRoom = null;

// Add these variables at the top - they need to be defined or imported
let authToken = null;
let currentUser = null;
const API_URL = 'https://api.karmakazi.org/api'; // CORRECTED: Added /api prefix

const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
];

// Add this function to initialize auth token
function getAuthToken() {
    // Get token from localStorage or sessionStorage
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
        console.error('No auth token found');
        // Redirect to login or show error
        return null;
    }
    return token;
}

function initializeChat() {
    // Initialize auth token
    authToken = getAuthToken();
    if (!authToken) {
        alert('Please log in to use chat');
        return;
    }

    const chatInterface = document.getElementById('chatInterface');
    
    chatInterface.innerHTML = `
        <div class="chat-container">
            <div class="chat-main">
                <div class="room-header">
                    <h3 id="roomName">Select or Create a Room</h3>
                    <button class="leave-btn" onclick="leaveRoom()" style="display: none;">Leave Room</button>
                </div>
                
                <div class="chat-area">
                    <div class="video-grid" id="videoGrid"></div>
                    <div class="messages-container">
                        <div class="messages" id="messages"></div>
                        <div class="message-input">
                            <input type="text" id="messageInput" placeholder="Type a message..." onkeypress="handleMessageKeypress(event)">
                            <button onclick="sendMessage()">Send</button>
                        </div>
                    </div>
                </div>
                
                <div class="controls">
                    <button id="toggleVideo" onclick="toggleVideo()">🎹 Video</button>
                    <button id="toggleAudio" onclick="toggleAudio()">🎤 Audio</button>
                    <button id="shareScreen" onclick="shareScreen()">🖥️ Share</button>
                </div>
            </div>
            
            <div class="chat-sidebar">
                <div class="room-controls">
                    <h4>Rooms</h4>
                    <button class="create-room-btn" onclick="showCreateRoomForm()">Create Room</button>
                </div>
                <div class="rooms-list" id="roomsList">
                    <!-- Rooms will be loaded here -->
                </div>
                <div class="participants-section">
                    <h4>Participants</h4>
                    <div id="participantsList"></div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize socket connection
    connectSocket();
    
    // Load available rooms
    loadChatRooms();
    
    // Request media permissions
    requestMediaPermissions();
}

function connectSocket() {
    // CORRECTED: Use base URL without /api for Socket.IO
    socket = io('https://api.karmakazi.org', {
        auth: {
            token: authToken
        }
    });
    
    socket.on('connect', () => {
        console.log('Connected to chat server');
    });
    
    socket.on('room-joined', (data) => {
        currentRoom = data;
        document.getElementById('roomName').textContent = data.roomName;
        document.querySelector('.leave-btn').style.display = 'block';
        addSystemMessage(`Joined room: ${data.roomName}`);
    });
    
    socket.on('user-joined', (data) => {
        addSystemMessage(`${data.username} joined the room`);
        updateParticipants();
    });
    
    socket.on('user-left', (data) => {
        addSystemMessage(`${data.username} left the room`);
        updateParticipants();
        if (peerConnections[data.userId]) {
            peerConnections[data.userId].close();
            delete peerConnections[data.userId];
        }
    });
    
    socket.on('message', (data) => {
        addMessage(data);
    });
    
    socket.on('kicked', (message) => {
        alert(message);
        leaveRoom();
    });
    
    socket.on('error', (error) => {
        alert(`Error: ${error}`);
    });
    
    // WebRTC signaling
    socket.on('offer', async (data) => {
        await handleOffer(data);
    });
    
    socket.on('answer', async (data) => {
        await handleAnswer(data);
    });
    
    socket.on('ice-candidate', async (data) => {
        await handleIceCandidate(data);
    });
}

async function requestMediaPermissions() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        // Add local video to grid
        addVideoStream('local', localStream, true);
        
        // Mute local audio to prevent echo
        localStream.getAudioTracks().forEach(track => {
            track.enabled = false;
        });
    } catch (error) {
        console.error('Error accessing media devices:', error);
    }
}

function addVideoStream(userId, stream, isLocal = false) {
    const videoGrid = document.getElementById('videoGrid');
    let video = document.getElementById(`video-${userId}`);
    
    if (!video) {
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        videoContainer.id = `container-${userId}`;
        
        video = document.createElement('video');
        video.id = `video-${userId}`;
        video.autoplay = true;
        video.playsinline = true;
        if (isLocal) {
            video.muted = true;
        }
        
        const label = document.createElement('div');
        label.className = 'video-label';
        label.textContent = isLocal ? 'You' : `User ${userId}`;
        
        videoContainer.appendChild(video);
        videoContainer.appendChild(label);
        videoGrid.appendChild(videoContainer);
    }
    
    video.srcObject = stream;
}

// FIXED: loadChatRooms function with correct API path and better error handling
async function loadChatRooms() {
    if (!authToken) {
        console.error('No auth token available');
        return;
    }

    try {
        console.log('Fetching rooms from:', `${API_URL}/rooms`);
        console.log('Using token:', authToken ? 'Token present' : 'No token');
        
        // CORRECTED: Now uses /api/rooms endpoint
        const response = await fetch(`${API_URL}/rooms`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to load rooms:', response.status, errorText);
            
            if (response.status === 401) {
                console.log('Authentication failed - token may be invalid or temporary');
                const roomsList = document.getElementById('roomsList');
                roomsList.innerHTML = '<div class="auth-error">Authentication required. Using temporary access.</div>';
                
                // Don't clear token immediately - might be temporary auth
                // Just show a message and continue
                return;
            } else if (response.status === 404) {
                console.log('Rooms endpoint not found');
                const roomsList = document.getElementById('roomsList');
                roomsList.innerHTML = '<div class="no-rooms">Rooms feature not available yet</div>';
                return;
            }
            return;
        }
        
        const rooms = await response.json();
        console.log('Loaded rooms:', rooms);
        
        const roomsList = document.getElementById('roomsList');
        
        if (!rooms || rooms.length === 0) {
            roomsList.innerHTML = '<div class="no-rooms">No rooms available. Create one to get started!</div>';
            return;
        }
        
        roomsList.innerHTML = rooms.map(room => `
            <div class="room-item" onclick="joinRoom('${room.room_code}')">
                <div class="room-info">
                    <span class="room-name">${room.room_name}</span>
                    <span class="room-code">${room.room_code}</span>
                </div>
                <div class="room-stats">
                    <span class="participant-count">${room.participant_count || 0}/${room.max_participants || 50}</span>
                    ${room.is_private ? '<span class="private-badge">🔒</span>' : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading rooms:', error);
        const roomsList = document.getElementById('roomsList');
        roomsList.innerHTML = '<div class="error">Network error. Check your connection.</div>';
    }
}

function showCreateRoomForm() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Create New Room</h3>
            <input type="text" id="newRoomName" placeholder="Room Name">
            <label>
                <input type="checkbox" id="isPrivate"> Private Room
            </label>
            <input type="password" id="roomPassword" placeholder="Room Password (optional)" style="display: none;">
            <input type="number" id="maxParticipants" placeholder="Max Participants" value="50" min="2" max="50">
            <button onclick="createRoom()">Create Room</button>
            <button onclick="closeModal()">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Show/hide password field based on private checkbox
    document.getElementById('isPrivate').addEventListener('change', (e) => {
        document.getElementById('roomPassword').style.display = e.target.checked ? 'block' : 'none';
    });
}

async function createRoom() {
    const roomName = document.getElementById('newRoomName').value;
    const isPrivate = document.getElementById('isPrivate').checked;
    const password = document.getElementById('roomPassword').value;
    const maxParticipants = parseInt(document.getElementById('maxParticipants').value);
    
    if (!roomName) {
        alert('Please enter a room name');
        return;
    }
    
    try {
        // CORRECTED: Now uses /api/rooms endpoint
        const response = await fetch(`${API_URL}/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                room_name: roomName,
                is_private: isPrivate,
                password: password,
                max_participants: maxParticipants
            })
        });
        
        if (!response.ok) {
            let errorMsg = 'Failed to create room';
            try {
                const error = await response.json();
                errorMsg = error.error || error.message || errorMsg;
            } catch (e) {
                if (response.status === 401) {
                    errorMsg = 'Authentication required to create rooms';
                } else if (response.status === 404) {
                    errorMsg = 'Room creation not available yet';
                }
            }
            alert(errorMsg);
            return;
        }
        
        const room = await response.json();
        closeModal();
        loadChatRooms();
        joinRoom(room.room_code);
    } catch (error) {
        console.error('Error creating room:', error);
        alert('Network error. Please try again.');
    }
}

function joinRoom(roomCode) {
    if (currentRoom && currentRoom.roomCode === roomCode) {
        return;
    }
    
    if (currentRoom) {
        leaveRoom();
    }
    
    socket.emit('join-room', roomCode);
}

function leaveRoom() {
    if (currentRoom) {
        socket.emit('leave-room', currentRoom.roomCode);
        currentRoom = null;
        document.getElementById('roomName').textContent = 'Select or Create a Room';
        document.querySelector('.leave-btn').style.display = 'none';
        document.getElementById('messages').innerHTML = '';
        document.getElementById('participantsList').innerHTML = '';
        
        // Close all peer connections
        Object.values(peerConnections).forEach(pc => pc.close());
        peerConnections = {};
    }
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message || !currentRoom) return;
    
    socket.emit('chat-message', {
        message: message,
        type: 'text'
    });
    
    input.value = '';
}

function handleMessageKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function addMessage(data) {
    const messagesDiv = document.getElementById('messages');
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    
    const isOwnMessage = currentUser && data.userId === currentUser.id;
    if (isOwnMessage) {
        messageEl.classList.add('own-message');
    }
    
    messageEl.innerHTML = `
        <div class="message-header">
            <span class="message-username">${data.username}</span>
            <span class="message-time">${new Date(data.timestamp).toLocaleTimeString()}</span>
        </div>
        <div class="message-content">${escapeHtml(data.message)}</div>
    `;
    
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addSystemMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const messageEl = document.createElement('div');
    messageEl.className = 'system-message';
    messageEl.textContent = message;
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateParticipants() {
    // This would fetch and display the list of participants
}

// Video controls
function toggleVideo() {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            document.getElementById('toggleVideo').textContent = videoTrack.enabled ? '🎹 Video' : '📷 Video';
        }
    }
}

function toggleAudio() {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            document.getElementById('toggleAudio').textContent = audioTrack.enabled ? '🎤 Audio' : '🔇 Audio';
        }
    }
}

async function shareScreen() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        });
        
        const videoTrack = screenStream.getVideoTracks()[0];
        Object.values(peerConnections).forEach(pc => {
            const senders = pc.getSenders();
            const videoSender = senders.find(s => s.track && s.track.kind === 'video');
            if (videoSender) {
                videoSender.replaceTrack(videoTrack);
            }
        });
        
        videoTrack.onended = () => {
            const cameraTrack = localStream.getVideoTracks()[0];
            Object.values(peerConnections).forEach(pc => {
                const senders = pc.getSenders();
                const videoSender = senders.find(s => s.track && s.track.kind === 'video');
                if (videoSender) {
                    videoSender.replaceTrack(cameraTrack);
                }
            });
        };
    } catch (error) {
        console.error('Error sharing screen:', error);
    }
}

// WebRTC handlers
async function createPeerConnection(userId) {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                to: userId,
                candidate: event.candidate
            });
        }
    };
    
    pc.ontrack = (event) => {
        addVideoStream(userId, event.streams[0]);
    };
    
    if (localStream) {
        localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
        });
    }
    
    peerConnections[userId] = pc;
    return pc;
}

async function handleOffer(data) {
    const pc = await createPeerConnection(data.from);
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    socket.emit('answer', {
        to: data.from,
        answer: answer
    });
}

async function handleAnswer(data) {
    const pc = peerConnections[data.from];
    if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
}

async function handleIceCandidate(data) {
    const pc = peerConnections[data.from];
    if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

function kickUser(userId) {
    if (currentUser && (currentUser.role === 'admin' || currentRoom.hostId === currentUser.id)) {
        socket.emit('kick-user', userId);
    }
}