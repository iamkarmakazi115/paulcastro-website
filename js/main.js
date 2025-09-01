// EMERGENCY MAIN.JS - CRITICAL FUNCTIONS FIRST
console.log('Main.js emergency version loading...');

// IMMEDIATE FUNCTION DEFINITIONS (MUST BE FIRST)
window.navigateToPage = function(pageId) {
    console.log('Emergency navigateToPage called for:', pageId);
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) selectedPage.classList.add('active');
    const navItem = document.querySelector(`[data-page="${pageId}"]`);
    if (navItem) navItem.classList.add('active');
};

window.loginAdmin = function() {
    console.log('Emergency loginAdmin called');
    const username = document.getElementById('adminUsername');
    const password = document.getElementById('adminPassword');
    const errorDiv = document.getElementById('adminLoginError');
    if (!username || !password) return;
    if (username.value.trim() === 'JohnC' && password.value.trim() === 'Gantz115!') {
        localStorage.setItem('authToken', 'admin-token-' + Date.now());
        localStorage.setItem('currentUser', JSON.stringify({username: 'JohnC', role: 'admin'}));
        username.value = '';
        password.value = '';
        const adminLogin = document.getElementById('adminLogin');
        const adminInterface = document.getElementById('adminInterface');
        if (adminLogin) adminLogin.style.display = 'none';
        if (adminInterface) {
            adminInterface.style.display = 'block';
            adminInterface.innerHTML = '<div style="padding:2rem;color:#fff;"><h3>Admin Login Successful!</h3><p>Welcome, ' + username + '</p><button onclick="window.logout()">Logout</button></div>';
        }
        if (errorDiv) errorDiv.textContent = '';
    } else {
        if (errorDiv) errorDiv.textContent = 'Invalid credentials';
    }
};

window.loginToChat = function() {
    console.log('Emergency loginToChat called');
    alert('Chat login functionality is available.');
};

window.logout = function() {
    localStorage.clear();
    location.reload();
};

// IMMEDIATE INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    console.log('Emergency DOM initialization');
    
    // Initialize navigation immediately
    document.querySelectorAll('.nav-item').forEach(function(item) {
        const page = item.getAttribute('data-page');
        item.addEventListener('click', function(e) {
            e.preventDefault();
            window.navigateToPage(page);
        });
        item.setAttribute('onclick', 'window.navigateToPage("' + page + '")');
    });
    
    // Initialize CTA buttons
    document.querySelectorAll('.cta-btn').forEach(function(button) {
        const onclick = button.getAttribute('onclick');
        if (onclick && onclick.includes('navigateToPage')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const match = onclick.match(/navigateToPage\(['"]([^'"]+)['"]\)/);
                if (match) window.navigateToPage(match[1]);
            });
        }
    });
    
    console.log('Emergency initialization complete');
});

// EVERYTHING BELOW THIS POINT IS ADDITIONAL FUNCTIONALITY
// API Configuration
const API_URL = 'https://api.karmakazi.org/api';
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// Enhanced navigation function (overwrites the emergency version)
function navigateToPage(pageId) {
    console.log('Enhanced navigateToPage called for:', pageId);
    
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
        console.log('Page activated:', pageId);
    }
    
    const navItem = document.querySelector(`[data-page="${pageId}"]`);
    if (navItem) {
        navItem.classList.add('active');
        console.log('Nav item activated:', pageId);
    }
    
    trackPageVisit(pageId);
    
    if (pageId === 'chat') {
        checkChatAccess();
    }
}

// Enhanced admin login (overwrites emergency version)
async function loginAdmin() {
    console.log('Enhanced loginAdmin called');
    
    const usernameInput = document.getElementById('adminUsername');
    const passwordInput = document.getElementById('adminPassword');
    const errorDiv = document.getElementById('adminLoginError');
    
    if (!usernameInput || !passwordInput) {
        if (errorDiv) errorDiv.textContent = 'Login form not found';
        return;
    }
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
        if (errorDiv) errorDiv.textContent = 'Please enter both username and password';
        return;
    }
    
    if (username === 'JohnC' && password === 'Gantz115!') {
        console.log('Admin login successful');
        if (errorDiv) errorDiv.textContent = '';
        
        authToken = 'mock-admin-token-' + Date.now();
        currentUser = { username: 'JohnC', role: 'admin', id: 1 };
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        usernameInput.value = '';
        passwordInput.value = '';
        
        loadAdminInterface();
        return;
    }
    
    if (errorDiv) errorDiv.textContent = 'Invalid admin credentials';
}

// Chat login function
async function loginToChat() {
    const usernameInput = document.getElementById('chatUsername');
    const passwordInput = document.getElementById('chatPassword');
    const errorDiv = document.getElementById('loginError');
    
    if (!usernameInput || !passwordInput) {
        if (errorDiv) errorDiv.textContent = 'Login form not found';
        return;
    }
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
        if (errorDiv) errorDiv.textContent = 'Please enter both username and password';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        
        usernameInput.value = '';
        passwordInput.value = '';
        if (errorDiv) errorDiv.textContent = '';
        
        loadChatInterface();
    } catch (error) {
        if (errorDiv) errorDiv.textContent = 'Connection error. Please try again.';
    }
}

// Update window functions with enhanced versions
window.navigateToPage = navigateToPage;
window.loginAdmin = loginAdmin;
window.loginToChat = loginToChat;

// Track page visits
async function trackPageVisit(page) {
    try {
        await fetch(`${API_URL}/analytics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page_visited: page, referrer: document.referrer })
        });
    } catch (error) {
        console.error('Analytics tracking failed:', error);
    }
}

// Check chat access
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

// Load chat interface
function loadChatInterface() {
    const chatLogin = document.getElementById('chatLogin');
    const chatInterface = document.getElementById('chatInterface');
    
    if (chatLogin) chatLogin.style.display = 'none';
    if (chatInterface) chatInterface.style.display = 'block';
    
    if (typeof initializeChat === 'function') {
        initializeChat();
    }
}

// Check admin access
function checkAdminAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const adminKey = urlParams.get('admin');
    
    if (adminKey === 'secure-admin-2024') {
        if (!document.querySelector('[data-page="admin"]')) {
            const navContainer = document.querySelector('.nav-container');
            if (navContainer) {
                const adminNav = document.createElement('div');
                adminNav.className = 'nav-item';
                adminNav.setAttribute('data-page', 'admin');
                adminNav.innerHTML = '<span class="nav-text">Admin</span>';
                adminNav.addEventListener('click', () => navigateToPage('admin'));
                navContainer.appendChild(adminNav);
                createAdminPage();
            }
        }
    }
}

// Create admin page
function createAdminPage() {
    const content = document.querySelector('.content');
    if (!content) return;
    
    const adminSection = document.createElement('section');
    adminSection.id = 'admin';
    adminSection.className = 'page';
    adminSection.innerHTML = `
        <div class="page-header"><h2 class="page-title">Admin Panel</h2></div>
        <div class="admin-content">
            <div class="admin-login" id="adminLogin">
                <div class="login-form">
                    <h3>Admin Authentication</h3>
                    <input type="text" id="adminUsername" placeholder="Admin Username">
                    <input type="password" id="adminPassword" placeholder="Admin Password">
                    <button class="login-btn" onclick="loginAdmin()">Login as Admin</button>
                    <div class="error-message" id="adminLoginError"></div>
                </div>
            </div>
            <div class="admin-interface" id="adminInterface" style="display: none;"></div>
        </div>
    `;
    content.appendChild(adminSection);
}

// Load admin interface
function loadAdminInterface() {
    const adminLogin = document.getElementById('adminLogin');
    const adminInterface = document.getElementById('adminInterface');
    
    if (adminLogin) adminLogin.style.display = 'none';
    if (!adminInterface) return;
    
    adminInterface.style.display = 'block';
    adminInterface.innerHTML = `
        <div class="admin-dashboard">
            <div class="admin-section">
                <h3>Welcome, Admin!</h3>
                <p>Successfully logged in as admin.</p>
                <p><strong>Username:</strong> ${currentUser ? currentUser.username : 'Unknown'}</p>
                <p><strong>Role:</strong> ${currentUser ? currentUser.role : 'Unknown'}</p>
                <p><strong>Login Time:</strong> ${new Date().toLocaleString()}</p>
                <button onclick="logout()">Logout</button>
            </div>
            <div class="admin-section">
                <h3>System Status</h3>
                <p>API Status: <span>Ready</span></p>
                <p>Admin Panel: <span>Active</span></p>
                <p>Current Time: <span id="currentTime">${new Date().toLocaleString()}</span></p>
            </div>
        </div>
    `;
    
    setInterval(() => {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) timeElement.textContent = new Date().toLocaleString();
    }, 1000);
}

// Enhanced logout function
window.logout = function() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    
    const adminLogin = document.getElementById('adminLogin');
    const adminInterface = document.getElementById('adminInterface');
    const chatLogin = document.getElementById('chatLogin');
    const chatInterface = document.getElementById('chatInterface');
    
    if (adminLogin) adminLogin.style.display = 'block';
    if (adminInterface) adminInterface.style.display = 'none';
    if (chatLogin) chatLogin.style.display = 'block';
    if (chatInterface) chatInterface.style.display = 'none';
    
    navigateToPage('home');
};

// Initialize everything after DOM loads (enhanced version)
setTimeout(function() {
    if (typeof checkAdminAccess === 'function') {
        checkAdminAccess();
    }
}, 500);

// Error handling
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('JavaScript Error:', { message: msg, source: url, line: lineNo, column: columnNo, error: error });
    return false;
};

console.log('Main.js emergency version fully loaded');
console.log('All functions available:', {
    navigateToPage: typeof window.navigateToPage,
    loginAdmin: typeof window.loginAdmin,
    loginToChat: typeof window.loginToChat,
    logout: typeof window.logout
});