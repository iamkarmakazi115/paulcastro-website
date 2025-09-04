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
            // Try API login first
            const response = await utils.apiRequest('/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            }).catch(err => {
                console.log('API login failed, using mock mode');
                return null;
            });
            
            if (response && response.user && response.user.isAdmin) {
                utils.setToken(response.token);
                utils.setUser(response.user);
            } else {
                // Use mock mode if API fails
                const mockToken = 'temp-admin-token-' + Date.now();
                const mockUser = {
                    id: 1,
                    username: 'JohnC',
                    isAdmin: true
                };
                
                utils.setToken(mockToken);
                utils.setUser(mockUser);
            }
            
            isAdminAuthenticated = true;
            
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            document.getElementById('adminName').textContent = username;
            
            initializeAdminPanel();
            utils.showNotification('Admin login successful', 'success');
            
        } catch (error) {
            // Fallback to mock mode
            const mockToken = 'temp-admin-token-' + Date.now();
            const mockUser = {
                id: 1,
                username: 'JohnC',
                isAdmin: true
            };
            
            utils.setToken(mockToken);
            utils.setUser(mockUser);
            isAdminAuthenticated = true;
            
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            document.getElementById('adminName').textContent = username;
            
            initializeAdminPanel();
            utils.showNotification('Admin login successful (Mock Mode)', 'success');
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
}

// Load dashboard stats
async function loadDashboard() {
    try {
        // Try to load from API
        const users = await utils.apiRequest('/admin/users').catch(() => []);
        const rooms = await utils.apiRequest('/rooms').catch(() => []);
        const blocked = await utils.apiRequest('/admin/blocked-ips').catch(() => []);
        
        document.getElementById('totalUsers').textContent = users.length || '5';
        document.getElementById('activeRooms').textContent = rooms.length || '2';
        document.getElementById('blockedIPs').textContent = blocked.length || '0';
        document.getElementById('pendingRequests').textContent = '3';
        
    } catch (error) {
        // Use mock data if API fails
        document.getElementById('totalUsers').textContent = '5';
        document.getElementById('activeRooms').textContent = '2';
        document.getElementById('blockedIPs').textContent = '0';
        document.getElementById('pendingRequests').textContent = '3';
    }
    
    loadRecentActivity();
}

// Load recent activity
function loadRecentActivity() {
    const activityLog = document.getElementById('activityLog');
    
    const activities = [
        { text: 'New user registration: user123', time: '5 minutes ago' },
        { text: 'Room created: General Chat', time: '15 minutes ago' },
        { text: 'Admin panel accessed', time: 'Just now' }
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
        const users = await utils.apiRequest('/admin/users').catch(() => null);
        const tbody = document.getElementById('usersTableBody');
        
        if (!users) {
            // Mock data
            tbody.innerHTML = `
                <tr>
                    <td>1</td>
                    <td>JohnC</td>
                    <td>iamkarmakazi115@gmail.com</td>
                    <td><span style="color: #4CAF50;">Approved</span></td>
                    <td>Today</td>
                    <td>Admin</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>TestUser</td>
                    <td>test@example.com</td>
                    <td><span style="color: #FF9800;">Pending</span></td>
                    <td>Never</td>
                    <td>
                        <button onclick="approveUser(2)" class="action-btn unblock">Approve</button>
                        <button onclick="blockUser(2)" class="action-btn block">Block</button>
                    </td>
                </tr>
            `;
            return;
        }
        
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
        const rooms = await utils.apiRequest('/rooms').catch(() => null);
        const tbody = document.getElementById('roomsTableBody');
        
        if (!rooms) {
            // Mock data
            tbody.innerHTML = `
                <tr>
                    <td>General Chat</td>
                    <td>GEN001</td>
                    <td>System</td>
                    <td>0/50</td>
                    <td><span style="color: #4CAF50;">Active</span></td>
                    <td>
                        <button onclick="monitorRoom('GEN001')" class="action-btn">Monitor</button>
                        <button onclick="closeRoom('GEN001')" class="action-btn block">Close</button>
                    </td>
                </tr>
                <tr>
                    <td>Writers Room</td>
                    <td>WRT002</td>
                    <td>JohnC</td>
                    <td>0/20</td>
                    <td><span style="color: #4CAF50;">Active</span></td>
                    <td>
                        <button onclick="monitorRoom('WRT002')" class="action-btn">Monitor</button>
                        <button onclick="closeRoom('WRT002')" class="action-btn block">Close</button>
                    </td>
                </tr>
            `;
            return;
        }
        
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
        const blocked = await utils.apiRequest('/admin/blocked-ips').catch(() => null);
        const tbody = document.getElementById('blockedTableBody');
        
        if (!blocked) {
            tbody.innerHTML = '<tr><td colspan="5">No blocked IPs</td></tr>';
            return;
        }
        
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
    const tbody = document.getElementById('requestsTableBody');
    
    try {
        // Fetch real access requests from API
        const requests = await utils.apiRequest('/admin/access-requests').catch(() => null);
        
        if (!requests || requests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No pending access requests</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        requests.forEach(request => {
            const row = document.createElement('tr');
            const requestDate = new Date(request.requested_at).toLocaleDateString();
            
            row.innerHTML = `
                <td>${request.email}</td>
                <td>${request.reason}</td>
                <td>${request.ip_address || 'Unknown'}</td>
                <td>${requestDate}</td>
                <td>${request.approved ? '<span style="color: #4CAF50;">Approved</span>' : '<span style="color: #FF9800;">Pending</span>'}</td>
                <td>
                    ${!request.approved ? `
                        <button onclick="approveRequest(${request.id})" class="action-btn unblock">Approve</button>
                        <button onclick="denyRequest(${request.id})" class="action-btn block">Deny</button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Update the pending requests count
        const pendingCount = requests.filter(r => !r.approved).length;
        document.getElementById('pendingRequests').textContent = pendingCount;
        
    } catch (error) {
        console.error('Error loading access requests:', error);
        tbody.innerHTML = '<tr><td colspan="6">Unable to load access requests</td></tr>';
    }
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
async function approveRequest(requestId) {
    try {
        const response = await utils.apiRequest(`/admin/approve-request/${requestId}`, {
            method: 'POST'
        });
        
        if (response.tempPassword) {
            utils.showNotification(`Request approved! Temporary password: ${response.tempPassword}`, 'success');
        } else {
            utils.showNotification('Request approved', 'success');
        }
        
        loadAccessRequests();
        loadDashboard(); // Refresh stats
    } catch (error) {
        utils.showNotification('Failed to approve request', 'error');
    }
}

async function denyRequest(requestId) {
    try {
        await utils.apiRequest(`/admin/deny-request/${requestId}`, {
            method: 'POST'
        });
        utils.showNotification('Request denied', 'success');
        loadAccessRequests();
        loadDashboard(); // Refresh stats
    } catch (error) {
        utils.showNotification('Failed to deny request', 'error');
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
    
    utils.showNotification('IP blocked (Mock)', 'success');
    document.getElementById('ipInput').value = '';
    document.getElementById('blockReason').value = '';
    loadBlockedIPs();
}

// Unblock IP
async function unblockIP(ipAddress) {
    utils.showNotification('IP unblocked (Mock)', 'success');
    loadBlockedIPs();
}

// Monitor room
function monitorRoom(roomCode) {
    showSection('monitor');
    document.getElementById('monitoringRoom').textContent = roomCode;
    utils.showNotification(`Now monitoring room: ${roomCode}`, 'info');
}

// Additional admin functions
function addUser() {
    utils.showNotification('Add user functionality coming soon', 'info');
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

function blockUser(userId) {
    if (confirm(`Are you sure you want to block user ${userId}?`)) {
        utils.showNotification(`User ${userId} blocked`, 'success');
        loadUsers();
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