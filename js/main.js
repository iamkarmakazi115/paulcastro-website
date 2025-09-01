// Main JavaScript for Paul Castro Website
console.log('Main.js starting to load...');

// API Configuration
const API_URL = 'https://api.karmakazi.org/api';
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// Immediately define and expose the navigation function
window.navigateToPage = function(pageId) {
    console.log('Real navigateToPage called for:', pageId);
    
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
        console.log('Page activated:', pageId);
    } else {
        console.error('Page not found:', pageId);
    }
    
    // Add active class to corresponding nav item
    const navItem = document.querySelector(`[data-page="${pageId}"]`);
    if (navItem) {
        navItem.classList.add('active');
        console.log('Nav item activated:', pageId);
    }
    
    // Track page visit
    trackPageVisit(pageId);
    
    // Special handling for certain pages
    if (pageId === 'works') {
        console.log('Works page selected, calling loadBooks');
        // Try multiple ways to ensure books load
        setTimeout(() => {
            if (typeof window.loadBooks === 'function') {
                console.log('Calling window.loadBooks');
                window.loadBooks();
            } else if (typeof loadBooks === 'function') {
                console.log('Calling loadBooks directly');
                loadBooks();
            } else {
                console.error('loadBooks function not found');
            }
        }, 100);
    } else if (pageId === 'chat') {
        checkChatAccess();
    }
};

// Immediately define and expose the admin login function
window.loginAdmin = async function() {
    console.log('Real loginAdmin called');
    
    const usernameInput = document.getElementById('adminUsername');
    const passwordInput = document.getElementById('adminPassword');
    const errorDiv = document.getElementById('adminLoginError');
    
    if (!usernameInput || !passwordInput) {
        console.error('Login form elements not found');
        if (errorDiv) errorDiv.textContent = 'Login form not found';
        return;
    }
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    console.log('Login attempt for:', username);
    
    if (!username || !password) {
        if (errorDiv) errorDiv.textContent = 'Please enter both username and password';
        return;
    }
    
    // Check hardcoded credentials first
    if (username === 'JohnC' && password === 'Gantz115!') {
        console.log('Hardcoded admin login successful');
        if (errorDiv) errorDiv.textContent = '';
        
        // Set mock admin data
        authToken = 'mock-admin-token-' + Date.now();
        currentUser = { username: 'JohnC', role: 'admin', id: 1 };
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Clear form
        usernameInput.value = '';
        passwordInput.value = '';
        
        // Load admin interface
        loadAdminInterface();
        return;
    }
    
    // If hardcoded credentials don't match, show error
    if (errorDiv) errorDiv.textContent = 'Invalid admin credentials';
    console.log('Invalid credentials provided');
};

// Immediately define and expose the chat login function
window.loginToChat = async function() {
    console.log('Real loginToChat called');
    
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
        usernameInput.value = '';
        passwordInput.value = '';
        if (errorDiv) errorDiv.textContent = '';
        
        // Load chat interface
        loadChatInterface();
    } catch (error) {
        console.error('Login error:', error);
        if (errorDiv) errorDiv.textContent = 'Connection error. Please try again.';
    }
};

// Store references to real functions
const navigateToPage = window.navigateToPage;
const loginAdmin = window.loginAdmin;
const loginToChat = window.loginToChat;

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - initializing...');
    
    // Re-expose functions to make sure they're available
    window.navigateToPage = navigateToPage;
    window.loginAdmin = loginAdmin;
    window.loginToChat = loginToChat;
    
    // Initialize navigation with both click handlers AND onclick attributes
    initializeNavigation();
    
    // Check for admin token in URL
    checkAdminAccess();
    
    // Initialize books - try multiple approaches
    setTimeout(function() {
        console.log('Attempting to load books...');
        
        // Check if we're on the works page and it's visible
        const worksPage = document.getElementById('works');
        if (worksPage && worksPage.classList.contains('active')) {
            console.log('Works page is active, loading books');
            tryLoadBooks();
        }
        
        // Also load books by default since it's the showcase
        tryLoadBooks();
    }, 200);
    
    console.log('Initialization complete');
});

// Function to try loading books with multiple fallbacks
function tryLoadBooks() {
    console.log('tryLoadBooks called');
    
    if (typeof window.loadBooks === 'function') {
        console.log('Found window.loadBooks, calling it');
        window.loadBooks();
    } else if (typeof loadBooks === 'function') {
        console.log('Found loadBooks, calling it');
        loadBooks();
    } else {
        console.log('loadBooks not found, will try again in 500ms');
        setTimeout(() => {
            if (typeof window.loadBooks === 'function') {
                console.log('Retry: calling window.loadBooks');
                window.loadBooks();
            } else {
                console.error('loadBooks function still not available after retry');
                // Manual fallback - load books inline
                loadBooksManually();
            }
        }, 500);
    }
}

// Manual fallback to load books if books.js fails
function loadBooksManually() {
    console.log('Loading books manually as fallback');
    const worksGrid = document.querySelector('.works-grid');
    if (!worksGrid) return;
    
    const fallbackBooks = [
        {
            title: "Blood Howls",
            subtitle: "When ancient blood awakens, the hunt begins.",
            description: "Kael Thorne's twenty-fifth birthday was supposed to be ordinary—dinner with family, maybe a call from his sister. Instead, it becomes the night his parents die and a supernatural assassin called the Hunter comes to claim what flows in his veins."
        },
        {
            title: "Forgotten Son",
            subtitle: "When the dead whisper warnings, a god's son must choose between love and cosmic order.",
            description: "Christos Thanatos has spent twenty-six years hiding in plain sight—working security jobs and pretending the voices of the dead are just background noise. The son of Hades should be ruling the underworld, but he's chosen the mortal world instead."
        },
        {
            title: "Out of Time",
            subtitle: "When a prince is murdered and hung like a scarecrow, the killer leaves behind more than a corpse.",
            description: "Cael Ward Corbin has spent years hiding what he is: a memory-binder caught between the Seelie and Unseelie Courts. When Prince Alarion is found crucified with the forbidden sigil of the Outriders, Cael's investigation unearths a conspiracy."
        },
        {
            title: "Which Way the Wind Blows",
            subtitle: "In the shadows between light and darkness, a bastard prince must choose his crown.",
            description: "When Veraden—son of the ruthless Queen Mab—rescues Lord Calendreth from an Unseelie dungeon, he triggers a war that will shatter the ancient balance between the courts."
        },
        {
            title: "The Descent - Book 1",
            subtitle: "Born from fire and hidden in shadow, Lucien Graves never knew he was heir to a throne built on blood.",
            description: "Bartending in the vampire-owned clubs of Kharvas, Lucien lives quietly until ancient relics begin awakening in his presence. When he discovers his true identity as the son of murdered vampire royalty, he's thrust into a war."
        },
        {
            title: "The Descent: Ash Reborn - Book 2",
            subtitle: "The fire within him was never meant to be carried by the living.",
            description: "Lucien Thorne awakens to a terrible truth—he died, and the Sixth Relic brought him back. Now he must confront the Council's final weapons while discovering that he is no longer merely a relic-bearer, but a living artifact himself."
        }
    ];
    
    worksGrid.innerHTML = fallbackBooks.map(book => `
        <div class="book-card">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-subtitle">${book.subtitle}</p>
            <p class="book-description">${book.description}</p>
        </div>
    `).join('');
    
    console.log('Manual book loading complete');
}

// Navigation initialization
function initializeNavigation() {
    console.log('Initializing navigation...');
    
    const navItems = document.querySelectorAll('.nav-item');
    console.log('Found nav items:', navItems.length);
    
    navItems.forEach(function(item, index) {
        const page = item.getAttribute('data-page');
        console.log('Processing nav item ' + index + ':', page);
        
        // Add click event listener
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Nav click event for:', page);
            navigateToPage(page);
        });
        
        // Also add onclick attribute as backup
        item.setAttribute('onclick', 'navigateToPage(\'' + page + '\')');
    });
    
    // Also handle CTA buttons
    const ctaButtons = document.querySelectorAll('.cta-btn');
    ctaButtons.forEach(function(button) {
        const onclick = button.getAttribute('onclick');
        if (onclick && onclick.includes('navigateToPage')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const match = onclick.match(/navigateToPage\(['"]([^'"]+)['"]\)/);
                if (match) {
                    navigateToPage(match[1]);
                }
            });
        }
    });
}

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
                adminNav.setAttribute('onclick', 'navigateToPage(\'admin\')');
                adminNav.innerHTML = '<span class="nav-text">Admin</span>';
                
                // Add event listener
                adminNav.addEventListener('click', function() {
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

// Load admin interface
async function loadAdminInterface() {
    console.log('Loading admin interface...');
    
    const adminLogin = document.getElementById('adminLogin');
    const adminInterface = document.getElementById('adminInterface');
    
    if (adminLogin) {
        adminLogin.style.display = 'none';
        console.log('Admin login hidden');
    }
    
    if (!adminInterface) {
        console.error('Admin interface element not found');
        return;
    }
    
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
                <h3>User Management</h3>
                <button onclick="showAddUserForm()">Add New User</button>
                <div id="usersList">
                    <p>User management features would connect to your API server.</p>
                    <p>API Status: ${API_URL}</p>
                </div>
            </div>
            <div class="admin-section">
                <h3>Active Rooms</h3>
                <div id="roomsList">
                    <p>Room management features would connect to your chat server.</p>
                </div>
            </div>
            <div class="admin-section">
                <h3>System Status</h3>
                <div id="systemStatus">
                    <p>API Status: <span class="status-indicator">Ready</span></p>
                    <p>Admin Panel: <span class="status-indicator">Active</span></p>
                    <p>Current Time: <span id="currentTime">${new Date().toLocaleString()}</span></p>
                </div>
            </div>
        </div>
    `;
    
    console.log('Admin interface loaded successfully');
    
    // Update time every second
    setInterval(function() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = new Date().toLocaleString();
        }
    }, 1000);
    
    // Try to load actual data if API is available
    loadUsers();
    loadRooms();
}

// Load users for admin (with fallback)
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
            usersList.innerHTML = '<p>API not available - this would show user management when your server is running.</p>';
            return;
        }
        
        const users = await response.json();
        
        usersList.innerHTML = users.map(user => `
            <div class="admin-item">
                <span>${user.username} (${user.role || 'user'})</span>
                <span>${user.email || 'No email'}</span>
                <span>Last login: ${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
        if (usersList) {
            usersList.innerHTML = '<p>API connection failed - this would show users when your server is running.</p>';
        }
    }
}

// Load rooms for admin (with fallback)
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
            roomsList.innerHTML = '<p>API not available - this would show active chat rooms when your server is running.</p>';
            return;
        }
        
        const rooms = await response.json();
        
        roomsList.innerHTML = rooms.map(room => `
            <div class="admin-item">
                <span>Room: ${room.name}</span>
                <span>Users: ${room.user_count || 0}</span>
                <span>Created: ${room.created_at ? new Date(room.created_at).toLocaleString() : 'Unknown'}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading rooms:', error);
        if (roomsList) {
            roomsList.innerHTML = '<p>API connection failed - this would show rooms when your server is running.</p>';
        }
    }
}

// Show add user form
window.showAddUserForm = function() {
    alert('Add user functionality would be implemented here when connected to your API server.');
};

// Logout function
window.logout = function() {
    console.log('Logging out...');
    
    // Clear storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    
    // Reset UI
    const adminLogin = document.getElementById('adminLogin');
    const adminInterface = document.getElementById('adminInterface');
    const chatLogin = document.getElementById('chatLogin');
    const chatInterface = document.getElementById('chatInterface');
    
    if (adminLogin) adminLogin.style.display = 'block';
    if (adminInterface) adminInterface.style.display = 'none';
    if (chatLogin) chatLogin.style.display = 'block';
    if (chatInterface) chatInterface.style.display = 'none';
    
    // Navigate to home
    navigateToPage('home');
    
    console.log('Logout complete');
};

// Enhanced error handling
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

// Debug function
window.testNavigation = function() {
    console.log('Testing navigation system...');
    const navItems = document.querySelectorAll('.nav-item');
    console.log('Found nav items:', navItems.length);
    
    navItems.forEach((item, index) => {
        const page = item.getAttribute('data-page');
        const onclick = item.getAttribute('onclick');
        console.log(`Nav ${index}: ${page}, onclick: ${onclick}`);
    });
    
    console.log('Functions available:');
    console.log('- navigateToPage:', typeof window.navigateToPage);
    console.log('- loginAdmin:', typeof window.loginAdmin);
    console.log('- loginToChat:', typeof window.loginToChat);
    console.log('- logout:', typeof window.logout);
    console.log('- loadBooks:', typeof window.loadBooks);
};

// Log when main.js is fully loaded
console.log('Main.js fully loaded and initialized');
console.log('Functions exposed:', {
    navigateToPage: typeof window.navigateToPage,
    loginAdmin: typeof window.loginAdmin,
    loginToChat: typeof window.loginToChat,
    logout: typeof window.logout
});