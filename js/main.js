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
    loadBooks();
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
        document.getElementById('chatLogin').style.display = 'block';
        document.getElementById('chatInterface').style.display = 'none';
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
        errorDiv.textContent = 'Please enter both username and password';
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
            errorDiv.textContent = error.error || 'Login failed';
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
        errorDiv.textContent = '';
        
        // Load chat interface
        loadChatInterface();
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Connection error. Please try again.';
    }
}

// Load chat interface after successful login
function loadChatInterface() {
    document.getElementById('chatLogin').style.display = 'none';
    document.getElementById('chatInterface').style.display = 'block';
    
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

// Create admin page dynamically
function createAdminPage() {
    const content = document.querySelector('.content');
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
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('adminLoginError');
    
    if (username !== 'JohnC' || password !== 'Gantz115!') {
        errorDiv.textContent = 'Invalid admin credentials';
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
            errorDiv.textContent = 'Authentication failed';
            return;
        }
        
        const data = await response.json();
        
        if (data.user.role !== 'admin') {
            errorDiv.textContent = 'Admin access required';
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
        errorDiv.textContent = 'Connection error';
    }
}

// Load admin interface
async function loadAdminInterface() {
    document.getElementById('adminLogin').style.display = 'none';
    const adminInterface = document.getElementById('adminInterface');
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
        </div>
    `;
    
    // Load admin data
    loadUsers();
    loadRooms();
    loadBlockedList();
}

// Load users for admin
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) return;
        
        const users = await response.json();
        const usersList = document.getElementById('usersList');
        
        usersList.innerHTML = users.map(user => `
            <div class="admin-item">
                <span>${user.username} (${user.role})</span>
                <span>${user.email || 'No email'}</span>
                <span>Last login: ${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load rooms for admin
async function loadRooms() {