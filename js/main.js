// MAIN.JS - CRITICAL FUNCTIONS FIRST
console.log('Main.js emergency version loading...');

// CRITICAL: Fix token retrieval function
function getAuthToken() {
    // Check both localStorage and sessionStorage
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
        console.log('No auth token found in storage');
        return null;
    }
    
    // Verify token format and expiration
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.log('Invalid token format');
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            return null;
        }
        
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < now) {
            console.log('Token expired');
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            return null;
        }
        
        console.log('Valid token found for user:', payload.username);
        return token;
    } catch (error) {
        console.error('Error parsing token:', error);
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        return null;
    }
}

// IMMEDIATE FUNCTION DEFINITIONS (MUST BE FIRST)
window.navigateToPage = function(pageId) {
    console.log('Emergency navigateToPage called for:', pageId);
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) selectedPage.classList.add('active');
    const navItem = document.querySelector(`[data-page="${pageId}"]`);
    if (navItem) navItem.classList.add('active');
    
    // Check chat access when navigating to chat
    if (pageId === 'chat') {
        checkChatAccess();
    }
};

window.loginAdmin = function() {
    console.log('Emergency loginAdmin called');
    const username = document.getElementById('adminUsername');
    const password = document.getElementById('adminPassword');
    const errorDiv = document.getElementById('adminLoginError');
    if (!username || !password) return;
    if (username.value.trim() === 'JohnC' && password.value.trim() === 'Gantz115!') {
        // Create a proper JWT-like token for consistency
        const mockToken = btoa(JSON.stringify({alg: "HS256", typ: "JWT"})) + '.' + 
                         btoa(JSON.stringify({id: 1, username: 'JohnC', role: 'admin', exp: Math.floor(Date.now()/1000) + 86400})) + 
                         '.mock-signature';
        
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('currentUser', JSON.stringify({username: 'JohnC', role: 'admin', id: 1}));
        
        // Update global variables
        window.authToken = mockToken;
        window.currentUser = {username: 'JohnC', role: 'admin', id: 1};
        
        username.value = '';
        password.value = '';
        const adminLogin = document.getElementById('adminLogin');
        const adminInterface = document.getElementById('adminInterface');
        if (adminLogin) adminLogin.style.display = 'none';
        if (adminInterface) {
            adminInterface.style.display = 'block';
            adminInterface.innerHTML = '<div style="padding:2rem;color:#fff;"><h3>Admin Login Successful!</h3><p>Welcome, JohnC</p><button onclick="window.logout()">Logout</button></div>';
        }
        if (errorDiv) errorDiv.textContent = '';
    } else {
        if (errorDiv) errorDiv.textContent = 'Invalid credentials';
    }
};

window.loginToChat = async function() {
    console.log('Emergency loginToChat called - now with API integration');
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
        console.log('Attempting chat login for:', username);
        
        // FIXED: Remove duplicate /api in URL path
        const response = await fetch('https://api.karmakazi.org/auth/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            let errorMsg = 'Login failed';
            try {
                const error = await response.json();
                errorMsg = error.error || error.message || `HTTP ${response.status}`;
            } catch (e) {
                errorMsg = `HTTP ${response.status} - ${response.statusText}`;
            }
            
            console.error('Login failed:', errorMsg);
            if (errorDiv) {
                errorDiv.style.color = '#f44336';
                errorDiv.textContent = errorMsg;
            }
            return;
        }
        
        const data = await response.json();
        console.log('Chat login successful:', data.user || data);
        
        // Store authentication data properly
        const token = data.token;
        const user = data.user || {username: username, id: data.id};
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update global variables immediately
        window.authToken = token;
        window.currentUser = user;
        
        // Clear form and show success
        usernameInput.value = '';
        passwordInput.value = '';
        if (errorDiv) {
            errorDiv.style.color = '#4CAF50';
            errorDiv.textContent = 'Login successful! Loading chat interface...';
        }
        
        // Load chat interface after brief delay
        setTimeout(() => {
            loadChatInterface();
        }, 1000);
        
    } catch (error) {
        console.error('Chat login error:', error);
        if (errorDiv) {
            errorDiv.style.color = '#f44336';
            errorDiv.textContent = 'Connection error. Please check your internet connection.';
        }
    }
};

window.logout = function() {
    console.log('Logging out user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('currentUser');
    window.authToken = null;
    window.currentUser = null;
    
    // Reset UI elements
    const adminLogin = document.getElementById('adminLogin');
    const adminInterface = document.getElementById('adminInterface');
    const chatLogin = document.getElementById('chatLogin');
    const chatInterface = document.getElementById('chatInterface');
    
    if (adminLogin) adminLogin.style.display = 'block';
    if (adminInterface) adminInterface.style.display = 'none';
    if (chatLogin) chatLogin.style.display = 'block';
    if (chatInterface) chatInterface.style.display = 'none';
    
    // Navigate to home
    window.navigateToPage('home');
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
    
    // Initialize auth state on page load
    initializeAuthState();
    
    console.log('Emergency initialization complete');
});

// EVERYTHING BELOW THIS POINT IS ADDITIONAL FUNCTIONALITY
// API Configuration
const API_URL = 'https://api.karmakazi.org';

// Initialize authentication state
function initializeAuthState() {
    const token = getAuthToken();
    const userStr = localStorage.getItem('currentUser');
    
    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            window.authToken = token;
            window.currentUser = user;
            console.log('Restored auth state for user:', user.username);
        } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('currentUser');
            window.authToken = null;
            window.currentUser = null;
        }
    } else {
        window.authToken = null;
        window.currentUser = null;
    }
}

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

// FIXED: Check chat access function
function checkChatAccess() {
    const token = getAuthToken();
    console.log('Checking chat access, authToken:', !!token);
    
    const chatLogin = document.getElementById('chatLogin');
    const chatInterface = document.getElementById('chatInterface');
    
    if (!token) {
        console.log('No valid token, showing login form');
        if (chatLogin) chatLogin.style.display = 'block';
        if (chatInterface) chatInterface.style.display = 'none';
    } else {
        console.log('Valid token found, loading chat interface');
        // Update global variables if they're not set
        if (!window.authToken) {
            window.authToken = token;
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                try {
                    window.currentUser = JSON.parse(userStr);
                } catch (error) {
                    console.error('Error parsing stored user:', error);
                }
            }
        }
        loadChatInterface();
    }
}

// FIXED: Load chat interface
function loadChatInterface() {
    console.log('Loading chat interface...');
    const chatLogin = document.getElementById('chatLogin');
    const chatInterface = document.getElementById('chatInterface');
    
    if (chatLogin) chatLogin.style.display = 'none';
    if (chatInterface) {
        chatInterface.style.display = 'block';
        
        // Initialize chat if function exists
        if (typeof initializeChat === 'function') {
            console.log('Initializing chat...');
            try {
                initializeChat();
            } catch (error) {
                console.error('Error initializing chat:', error);
                chatInterface.innerHTML = `
                    <div style="padding: 2rem; text-align: center; color: #fff;">
                        <h3>Chat Initialization Error</h3>
                        <p>There was an error loading the chat interface.</p>
                        <p>Error: ${error.message}</p>
                        <button onclick="window.logout()">Logout and Retry</button>
                    </div>
                `;
            }
        } else {
            console.log('initializeChat function not found, showing fallback');
            // Fallback: show a basic interface
            chatInterface.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: #fff;">
                    <h3>Chat Interface Loading...</h3>
                    <p>Welcome, ${window.currentUser ? window.currentUser.username : 'User'}!</p>
                    <p>Chat functionality is being initialized.</p>
                    <p><small>If this message persists, please refresh the page.</small></p>
                    <button onclick="window.logout()">Logout</button>
                </div>
            `;
        }
    } else {
        console.error('Chat interface element not found');
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
                <p><strong>Username:</strong> ${window.currentUser ? window.currentUser.username : 'Unknown'}</p>
                <p><strong>Role:</strong> ${window.currentUser ? window.currentUser.role : 'Unknown'}</p>
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

// Check if user is already logged in on page load
const initialToken = getAuthToken();
if (initialToken && window.currentUser) {
    console.log('Found existing auth token for user:', window.currentUser.username);
}