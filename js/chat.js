// ============================================
// js/chat.js - Chat Page Functionality
// ============================================

let socket = null;
let localStream = null;
let peerConnections = {};
let currentRoom = null;
let isVideoEnabled = true;
let isAudioEnabled = true;

// Initialize chat functionality
document.addEventListener('DOMContentLoaded', () => {
    if (!utils.isLoggedIn()) {
        window.location.href = '/index.html';
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
        // Initialize peer connection for new user
        initializePeerConnection(data.userId);
    });

    socket.on('user-left', (data) => {
        addSystemMessage(`${data.username} left the room`);
        // Clean up peer connection
        if (peerConnections[data.userId]) {
            peerConnections[data.userId].close();
            delete peerConnections[data.userId];
        }
        // Remove video element
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

    socket.on('webrtc-offer', async (data) => {
        await handleWebRTCOffer(data);
    });

    socket.on('webrtc-answer', async (data) => {
        await handleWebRTCAnswer(data);
    });

    socket.on('webrtc-ice-candidate', async (data) => {
        await handleICECandidate(data);
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
        utils.showNotification('Unable to access camera/microphone', 'error');
    }
}

// Load available rooms
async function loadRooms() {
    try {
        const rooms = await utils.apiRequest('/rooms');
        const roomsList = document.getElementById('roomsList');
        roomsList.innerHTML = '';
        
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
    }
}

// Create a new room
async function createRoom() {
    const roomName = document.getElementById('newRoomName').value;
    const isPrivate = document.getElementById('privateRoom').checked;
    const maxUsers = document.getElementById('maxUsers').value;
    
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
        document.getElementById('newRoomName').value = '';
        loadRooms();
        joinRoom(room.room_code);
    } catch (error) {
        utils.showNotification('Failed to create room', 'error');
    }
}

// Join a room
function joinRoom(roomCode) {
    if (currentRoom) {
        leaveRoom();
    }
    
    socket.emit('join-room', roomCode);
    currentRoom = roomCode;
    
    document.getElementById('roomCode').textContent = `Code: ${roomCode}`;
    
    // Mark room as active
    document.querySelectorAll('.room-item').forEach(item => {
        item.classList.remove('active');
        if (item.querySelector('.room-name').textContent.includes(roomCode)) {
            item.classList.add('active');
        }
    });
}

// Leave current room
function leaveRoom() {
    if (currentRoom) {
        socket.emit('leave-room', currentRoom);
        currentRoom = null;
        
        // Clean up peer connections
        Object.values(peerConnections).forEach(pc => pc.close());
        peerConnections = {};
        
        // Clear video grid except local video
        const videoGrid = document.getElementById('videoGrid');
        const videos = videoGrid.querySelectorAll('.video-container:not(#localVideoContainer)');
        videos.forEach(video => video.remove());
        
        // Clear chat
        document.getElementById('chatMessages').innerHTML = '<div class="message system"><span>Left the room</span></div>';
        
        // Update UI
        document.getElementById('roomName').textContent = 'Select a Room';
        document.getElementById('roomCode').textContent = '';
    }
}

// Toggle video
function toggleVideo() {
    isVideoEnabled = !isVideoEnabled;
    localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoEnabled;
    });
    
    const btn = document.getElementById('videoToggle');
    btn.classList.toggle('active', isVideoEnabled);
    btn.innerHTML = isVideoEnabled ? '<i class="fas fa-video"></i>' : '<i class="fas fa-video-slash"></i>';
}

// Toggle audio
function toggleAudio() {
    isAudioEnabled = !isAudioEnabled;
    localStream.getAudioTracks().forEach(track => {
        track.enabled = isAudioEnabled;
    });
    
    const btn = document.getElementById('audioToggle');
    btn.classList.toggle('active', isAudioEnabled);
    btn.innerHTML = isAudioEnabled ? '<i class="fas fa-microphone"></i>' : '<i class="fas fa-microphone-slash"></i>';
}

// Share screen
async function shareScreen() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
        });
        
        const videoTrack = screenStream.getVideoTracks()[0];
        
        // Replace video track in all peer connections
        Object.values(peerConnections).forEach(pc => {
            const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender) {
                sender.replaceTrack(videoTrack);
            }
        });
        
        // Update local video
        document.getElementById('localVideo').srcObject = screenStream;
        
        // When screen share ends, switch back to camera
        videoTrack.onended = () => {
            setupMediaDevices();
        };
    } catch (error) {
        console.error('Error sharing screen:', error);
    }
}

// Send chat message
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message && currentRoom) {
        socket.emit('send-message', { message });
        input.value = '';
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
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.innerHTML = `<span>${message}</span>`;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Update room info
function updateRoomInfo(data) {
    document.getElementById('roomName').textContent = data.room.room_name;
    
    // Update participants list
    const participantsList = document.getElementById('participantsList');
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
    document.getElementById('targetUsername').textContent = username;
    document.getElementById('hostControlsModal').style.display = 'flex';
    window.targetUserId = userId;
}

// Close host controls
function closeHostControls() {
    document.getElementById('hostControlsModal').style.display = 'none';
    window.targetUserId = null;
}

// Kick user
function kickUser(ban) {
    const reason = document.getElementById('kickReason').value;
    
    socket.emit('kick-user', {
        userId: window.targetUserId,
        ban: ban,
        reason: reason
    });
    
    closeHostControls();
    utils.showNotification(`User ${ban ? 'banned' : 'kicked'} from room`, 'success');
}

// WebRTC functions
function initializePeerConnection(userId) {
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    };
    
    const pc = new RTCPeerConnection(configuration);
    peerConnections[userId] = pc;
    
    // Add local stream
    localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
    });
    
    // Handle remote stream
    pc.ontrack = (event) => {
        addRemoteVideo(userId, event.streams[0]);
    };
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('webrtc-ice-candidate', {
                candidate: event.candidate,
                to: userId
            });
        }
    };
    
    return pc;
}

// Add remote video
function addRemoteVideo(userId, stream) {
    let videoContainer = document.getElementById(`video-${userId}`);
    
    if (!videoContainer) {
        videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        videoContainer.id = `video-${userId}`;
        
        const video = document.createElement('video');
        video.autoplay = true;
        video.srcObject = stream;
        
        const label = document.createElement('div');
        label.className = 'video-label';
        label.textContent = `User ${userId}`;
        
        videoContainer.appendChild(video);
        videoContainer.appendChild(label);
        
        document.getElementById('videoGrid').appendChild(videoContainer);
    }
}

async function handleWebRTCOffer(data) {
    const pc = initializePeerConnection(data.from);
    await pc.setRemoteDescription(data.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    socket.emit('webrtc-answer', {
        answer: answer,
        to: data.from
    });
}

async function handleWebRTCAnswer(data) {
    const pc = peerConnections[data.from];
    if (pc) {
        await pc.setRemoteDescription(data.answer);
    }
}

async function handleICECandidate(data) {
    const pc = peerConnections[data.from];
    if (pc) {
        await pc.addIceCandidate(data.candidate);
    }
}

// ============================================
// js/admin.js - Admin Page Functionality
// ============================================

let adminSocket = null;
let isAdminAuthenticated = false;

// Handle admin login
async function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Check if it's the hardcoded admin
    if (username === 'JohnC' && password === 'Gantz115!') {
        try {
            const response = await utils.apiRequest('/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            
            if (response.user.isAdmin) {
                utils.setToken(response.token);
                utils.setUser(response.user);
                isAdminAuthenticated = true;
                
                document.getElementById('adminLogin').style.display = 'none';
                document.getElementById('adminPanel').style.display = 'block';
                document.getElementById('adminName').textContent = username;
                
                initializeAdminPanel();
                utils.showNotification('Admin login successful', 'success');
            } else {
                throw new Error('Not an admin user');
            }
        } catch (error) {
            utils.showNotification('Invalid admin credentials', 'error');
        }
    } else {
        utils.showNotification('Invalid admin credentials', 'error');
    }
}

// Admin logout
function adminLogout() {
    utils.removeToken();
    utils.removeUser();
    isAdminAuthenticated = false;
    window.location.href = '/index.html';
}

// Initialize admin panel
async function initializeAdminPanel() {
    if (!isAdminAuthenticated) return;
    
    loadDashboard();
    loadUsers();
    loadRooms();
    loadBlockedIPs();
    loadAccessRequests();
    initializeAdminSocket();
}

// Load dashboard stats
async function loadDashboard() {
    try {
        // Load users count
        const users = await utils.apiRequest('/admin/users');
        document.getElementById('totalUsers').textContent = users.length;
        
        // Load rooms count
        const rooms = await utils.apiRequest('/rooms');
        document.getElementById('activeRooms').textContent = rooms.length;
        
        // Load blocked IPs count
        const blocked = await utils.apiRequest('/admin/blocked-ips');
        document.getElementById('blockedIPs').textContent = blocked.length;
        
        // Load pending requests (simulated)
        document.getElementById('pendingRequests').textContent = '3';
        
        // Load recent activity
        loadRecentActivity();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load recent activity
function loadRecentActivity() {
    const activityLog = document.getElementById('activityLog');
    
    // Simulated activity data
    const activities = [
        { text: 'New user registration: user123', time: '5 minutes ago' },
        { text: 'Room created: General Chat', time: '15 minutes ago' },
        { text: 'IP blocked: 192.168.1.100', time: '1 hour ago' },
        { text: 'User banned from room: troublemaker', time: '2 hours ago' },
        { text: 'Access request approved: newuser@email.com', time: '3 hours ago' }
    ];
    
    activityLog.innerHTML = '';
    activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <span class="activity-text">${activity.text}</span>
            <span class="activity-time">${activity.time}</span>
        `;
        activityLog.appendChild(item);
    });
}

// Load users
async function loadUsers() {
    try {
        const users = await utils.apiRequest('/admin/users');
        const tbody = document.getElementById('usersTableBody');
        
        tbody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.is_approved ? '<span style="color: #4CAF50;">Approved</span>' : '<span style="color: #FF9800;">Pending</span>'}</td>
                <td>${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                <td>
                    ${!user.is_approved ? `<button onclick="approveUser(${user.id})" class="action-btn unblock">Approve</button>` : ''}
                    <button onclick="blockUser(${user.id})" class="action-btn block">Block</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load rooms
async function loadRooms() {
    try {
        const rooms = await utils.apiRequest('/rooms');
        const tbody = document.getElementById('roomsTableBody');
        
        tbody.innerHTML = '';
        rooms.forEach(room => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${room.room_name}</td>
                <td>${room.room_code}</td>
                <td>${room.host_name || 'System'}</td>
                <td>${room.user_count || 0}/${room.max_users}</td>
                <td>${room.is_active ? '<span style="color: #4CAF50;">Active</span>' : '<span style="color: #FF5252;">Inactive</span>'}</td>
                <td>
                    <button onclick="monitorRoom('${room.room_code}')" class="action-btn">Monitor</button>
                    <button onclick="closeRoom('${room.room_code}')" class="action-btn block">Close</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

// Load blocked IPs
async function loadBlockedIPs() {
    try {
        const blocked = await utils.apiRequest('/admin/blocked-ips');
        const tbody = document.getElementById('blockedTableBody');
        
        tbody.innerHTML = '';
        blocked.forEach(ip => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ip.ip_address}</td>
                <td>${ip.reason || 'No reason provided'}</td>
                <td>Admin</td>
                <td>${new Date(ip.blocked_at).toLocaleDateString()}</td>
                <td>
                    <button onclick="unblockIP('${ip.ip_address}')" class="action-btn unblock">Unblock</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading blocked IPs:', error);
    }
}

// Load access requests
async function loadAccessRequests() {
    // This would normally load from the API
    const tbody = document.getElementById('requestsTableBody');
    
    // Simulated data
    const requests = [
        {
            email: 'user1@example.com',
            reason: 'Interested in your writing',
            ip: '192.168.1.50',
            date: new Date(),
            approved: false
        },
        {
            email: 'fan@example.com',
            reason: 'Want to join the community',
            ip: '192.168.1.51',
            date: new Date(Date.now() - 86400000),
            approved: false
        }
    ];
    
    tbody.innerHTML = '';
    requests.forEach((request, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.email}</td>
            <td>${request.reason}</td>
            <td>${request.ip}</td>
            <td>${request.date.toLocaleDateString()}</td>
            <td>${request.approved ? '<span style="color: #4CAF50;">Approved</span>' : '<span style="color: #FF9800;">Pending</span>'}</td>
            <td>
                ${!request.approved ? `
                    <button onclick="approveRequest(${index})" class="action-btn unblock">Approve</button>
                    <button onclick="denyRequest(${index})" class="action-btn block">Deny</button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Show section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(s => {
        s.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(`${section}Section`).style.display = 'block';
    
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');
}

// Approve user
async function approveUser(userId) {
    try {
        await utils.apiRequest(`/admin/approve-user/${userId}`, {
            method: 'POST'
        });
        utils.showNotification('User approved', 'success');
        loadUsers();
    } catch (error) {
        utils.showNotification('Failed to approve user', 'error');
    }
}

// Block IP
async function blockIP() {
    const ipAddress = document.getElementById('ipInput').value;
    const reason = document.getElementById('blockReason').value;
    
    if (!ipAddress) {
        utils.showNotification('Please enter an IP address', 'error');
        return;
    }
    
    try {
        await utils.apiRequest('/admin/block-ip', {
            method: 'POST',
            body: JSON.stringify({ ipAddress, reason })
        });
        
        utils.showNotification('IP blocked successfully', 'success');
        document.getElementById('ipInput').value = '';
        document.getElementById('blockReason').value = '';
        loadBlockedIPs();
    } catch (error) {
        utils.showNotification('Failed to block IP', 'error');
    }
}

// Unblock IP
async function unblockIP(ipAddress) {
    try {
        await utils.apiRequest('/admin/unblock-ip', {
            method: 'POST',
            body: JSON.stringify({ ipAddress })
        });
        
        utils.showNotification('IP unblocked successfully', 'success');
        loadBlockedIPs();
    } catch (error) {
        utils.showNotification('Failed to unblock IP', 'error');
    }
}

// Monitor room
function monitorRoom(roomCode) {
    showSection('monitor');
    document.getElementById('monitoringRoom').textContent = roomCode;
    
    // In a real implementation, this would connect to the room's video/chat feed
    utils.showNotification(`Now monitoring room: ${roomCode}`, 'info');
}

// Initialize admin socket for live monitoring
function initializeAdminSocket() {
    adminSocket = io(WS_URL, {
        auth: {
            token: utils.getToken()
        }
    });
    
    adminSocket.on('connect', () => {
        console.log('Admin connected to monitoring system');
    });
}

// Additional admin functions
function addUser() {
    // Implementation for adding new user
    utils.showNotification('Add user functionality to be implemented', 'info');
}

function approveRequest(index) {
    utils.showNotification('Request approved', 'success');
    loadAccessRequests();
}

function denyRequest(index) {
    utils.showNotification('Request denied', 'success');
    loadAccessRequests();
}

function muteAllUsers() {
    utils.showNotification('All users muted in monitored room', 'success');
}

function clearChat() {
    utils.showNotification('Chat cleared in monitored room', 'success');
}

function closeRoom(roomCode) {
    if (confirm(`Are you sure you want to close room ${roomCode}?`)) {
        utils.showNotification(`Room ${roomCode} closed`, 'success');
        loadRooms();
    }
}

// Search functionality for users table
document.addEventListener('DOMContentLoaded', () => {
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#usersTableBody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
});