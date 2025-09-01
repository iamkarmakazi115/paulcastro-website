// Main JavaScript for Paul Castro Website

// API Configuration
const API_URL = 'https://api.karmakazi.org/api';
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// Page Navigation
function navigateToPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Add active class to corresponding nav item
    const navItem = document.querySelector(`[data-page="${pageId}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Track page visit
    trackPageVisit(pageId);
    
    // Special handling for certain pages
    if (pageId === 'works') {
        loadBooks();
    } else if (pageId === 'chat') {
        checkChatAccess();
    }
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers to navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            navigateToPage(page);
        });
    });
    
    // Check for admin token in URL (for admin page access)
    checkAdminAccess();
    
    // Initialize page
    if (typeof loadBooks === 'function') {
        loadBooks();
    }
});

// Track page visits for analytics
async function trackPageVisit(page) {
    try {
        await fetch(`${API_URL}/analytics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                page_visited: page,
                referrer: document.referrer
            })
        });
    } catch (error) {
        console.error('Analytics tracking failed:', error);
    }
}

// Check if user has chat access
function checkChatAccess() {
    if (!authToken) {
        const chatLogin = document.getElementById('chatLogin');
        const chatInterface = document.getElementById('chatInterface');
        if (chatLogin) chatLogin.style.display = 'block';
        if (chatInterface) chatInterface.style.display = 'none';
    } else {
        loadChatInterface();
    }
}

// Login to chat
async function loginToChat() {
    const username = document.getElementById('chatUsername').value;
    const password = document.getElementById('chatPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!username || !password) {
        if (errorDiv) errorDiv.textContent = 'Please enter both username and password';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            if (errorDiv) errorDiv.textContent = error.error || 'Login failed';
            return;
        }
        
        const data = await response.json();
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Clear form
        document.getElementById('chatUsername').value = '';
        document.getElementById('chatPassword').value = '';
        if (errorDiv) errorDiv.textContent = '';
        
        // Load chat interface
        loadChatInterface();
    } catch (error) {
        console.error('Login error:', error);
        if (errorDiv) errorDiv.textContent = 'Connection error. Please try again.';
    }
}

// Load chat interface after successful login
function loadChatInterface() {
    const chatLogin = document.getElementById('chatLogin');
    const chatInterface = document.getElementById('chatInterface');
    
    if (chatLogin) chatLogin.style.display = 'none';
    if (chatInterface) chatInterface.style.display = 'block';
    
    // Load the chat component
    if (typeof initializeChat === 'function') {
        initializeChat();
    }
}

// Check for admin access
function checkAdminAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const adminKey = urlParams.get('admin');
    
    if (adminKey === 'secure-admin-2024') {
        // Add admin navigation item if not present
        if (!document.querySelector('[data-page="admin"]')) {
            const navContainer = document.querySelector('.nav-container');
            if (navContainer) {
                const adminNav = document.createElement('div');
                adminNav.className = 'nav-item';
                adminNav.setAttribute('data-page', 'admin');
                adminNav.innerHTML = '<span class="nav-text">Admin</span>';
                adminNav.addEventListener('click', () => {
                    navigateToPage('admin');
                });
                navContainer.appendChild(adminNav);
                
                // Create admin page
                createAdminPage();
            }
        }
    }
}

// Create admin page dynamically
function createAdminPage() {
    const content = document.querySelector('.content');
    if (!content) return;
    
    const adminSection = document.createElement('section');
    adminSection.id = 'admin';
    adminSection.className = 'page';
    adminSection.innerHTML = `
        <div class="page-header">
            <h2 class="page-title">Admin Panel</h2>
        </div>
        <div class="admin-content">
            <div class="admin-login" id="adminLogin">
                <div class="login-form">
                    <h3>Admin Authentication</h3>
                    <input type="text" id="adminUsername" placeholder="Admin Username" autocomplete="username">
                    <input type="password" id="adminPassword" placeholder="Admin Password" autocomplete="current-password">
                    <button class="login-btn" onclick="loginAdmin()">Login as Admin</button>
                    <div class="error-message" id="adminLoginError"></div>
                </div>
            </div>
            <div class="admin-interface" id="adminInterface" style="display: none;">
                <!-- Admin interface will be loaded here -->
            </div>
        </div>
    `;
    content.appendChild(adminSection);
}

// Admin login
async function loginAdmin() {
    const usernameInput = document.getElementById('adminUsername');
    const passwordInput = document.getElementById('adminPassword');
    const errorDiv = document.getElementById('adminLoginError');
    
    if (!usernameInput || !passwordInput) {
        if (errorDiv) errorDiv.textContent = 'Login form not found';
        return;
    }
    
    const username = usernameInput.value;
    const password = passwordInput.value;
    
    if (username !== 'JohnC' || password !== 'Gantz115!') {
        if (errorDiv) errorDiv.textContent = 'Invalid admin credentials';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            if (errorDiv) errorDiv.textContent = 'Authentication failed';
            return;
        }
        
        const data = await response.json();
        
        if (data.user && data.user.role !== 'admin') {
            if (errorDiv) errorDiv.textContent = 'Admin access required';
            return;
        }
        
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Load admin interface
        loadAdminInterface();
    } catch (error) {
        console.error('Admin login error:', error);
        if (errorDiv) errorDiv.textContent = 'Connection error';
    }
}

// Load admin interface
async function loadAdminInterface() {
    const adminLogin = document.getElementById('adminLogin');
    const adminInterface = document.getElementById('adminInterface');
    
    if (adminLogin) adminLogin.style.display = 'none';
    if (!adminInterface) return;
    
    adminInterface.style.display = 'block';
    
    adminInterface.innerHTML = `
        <div class="admin-dashboard">
            <div class="admin-section">
                <h3>User Management</h3>
                <button onclick="showAddUserForm()">Add New User</button>
                <div id="usersList"></div>
            </div>
            <div class="admin-section">
                <h3>Active Rooms</h3>
                <div id="roomsList"></div>
            </div>
            <div class="admin-section">
                <h3>Blocked List</h3>
                <div id="blockedList"></div>
            </div>
            <div class="admin-section">
                <h3>System Status</h3>
                <div id="systemStatus">
                    <p>API Status: <span class="status-indicator">Connected</span></p>
                    <p>Users Online: <span id="onlineCount">0</span></p>
                </div>
            </div>
        </div>
    `;
    
    // Load admin data
    loadUsers();
    loadRooms();
    loadBlockedList();
}

// Load users for admin
async function loadUsers() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            usersList.innerHTML = '<p>Error loading users</p>';
            return;
        }
        
        const users = await response.json();
        
        usersList.innerHTML = users.map(user => `
            <div class="admin-item">
                <span>${user.username} (${user.role})</span>
                <span>${user.email || 'No email'}</span>
                <span>Last login: ${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
        if (usersList) usersList.innerHTML = '<p>Connection error</p>';
    }
}

// Load rooms for admin
async function loadRooms() {
    const roomsList = document.getElementById('roomsList');
    if (!roomsList) return;
    
    try {
        const response = await fetch(`${API_URL}/rooms`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            roomsList.innerHTML = '<p>Error loading rooms</p>';
            return;
        }
        
        const rooms = await response.json();
        
        roomsList.innerHTML = rooms.map(room => `
            <div class="admin-item">
                <span>Room: ${room.name}</span>
                <span>Users: ${room.user_count}</span>
                <span>Created: ${new Date(room.created_at).toLocaleString()}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading rooms:', error);
        if (roomsList) roomsList.innerHTML = '<p>Connection error</p>';
    }
}

// Load blocked list for admin
async function loadBlockedList() {
    const blockedList = document.getElementById('blockedList');
    if (!blockedList) return;
    
    try {
        const response = await fetch(`${API_URL}/blocked`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            blockedList.innerHTML = '<p>Error loading blocked list</p>';
            return;
        }
        
        const blocked = await response.json();
        
        blockedList.innerHTML = blocked.map(item => `
            <div class="admin-item">
                <span>User: ${item.username}</span>
                <span>Reason: ${item.reason}</span>
                <span>Blocked: ${new Date(item.blocked_at).toLocaleString()}</span>
                <button onclick="unblockUser(${item.id})">Unblock</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading blocked list:', error);
        if (blockedList) blockedList.innerHTML = '<p>Connection error</p>';
    }
}

// Show add user form
function showAddUserForm() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    const formHTML = `
        <div class="add-user-form">
            <h4>Add New User</h4>
            <input type="text" id="newUsername" placeholder="Username">
            <input type="email" id="newEmail" placeholder="Email">
            <input type="password" id="newPassword" placeholder="Password">
            <select id="newRole">
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>
            <button onclick="addUser()">Add User</button>
            <button onclick="cancelAddUser()">Cancel</button>
        </div>
    `;
    
    usersList.insertAdjacentHTML('afterbegin', formHTML);
}

// Add new user
async function addUser() {
    const username = document.getElementById('newUsername').value;
    const email = document.getElementById('newEmail').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;
    
    if (!username || !password) {
        alert('Username and password are required');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ username, email, password, role })
        });
        
        if (!response.ok) {
            const error = await response.json();
            alert(error.error || 'Failed to add user');
            return;
        }
        
        // Refresh users list
        loadUsers();
    } catch (error) {
        console.error('Error adding user:', error);
        alert('Connection error');
    }
}

// Cancel add user
function cancelAddUser() {
    const form = document.querySelector('.add-user-form');
    if (form) form.remove();
}

// Unblock user
async function unblockUser(id) {
    try {
        const response = await fetch(`${API_URL}/blocked/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            alert('Failed to unblock user');
            return;
        }
        
        // Refresh blocked list
        loadBlockedList();
    } catch (error) {
        console.error('Error unblocking user:', error);
        alert('Connection error');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    
    // Redirect to home page
    if (typeof navigateToPage === 'function') {
        navigateToPage('home');
    }
    
    // Reset login forms
    const chatLogin = document.getElementById('chatLogin');
    const chatInterface = document.getElementById('chatInterface');
    const adminLogin = document.getElementById('adminLogin');
    const adminInterface = document.getElementById('adminInterface');
    
    if (chatLogin) chatLogin.style.display = 'block';
    if (chatInterface) chatInterface.style.display = 'none';
    if (adminLogin) adminLogin.style.display = 'block';
    if (adminInterface) adminInterface.style.display = 'none';
}

// Error handling for undefined functions
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('JavaScript Error:', {
        message: msg,
        source: url,
        line: lineNo,
        column: columnNo,
        error: error
    });
    return false;
};

// Make functions globally available
window.navigateToPage = navigateToPage;
window.loginAdmin = loginAdmin;
window.loginToChat = loginToChat;
window.logout = logout;