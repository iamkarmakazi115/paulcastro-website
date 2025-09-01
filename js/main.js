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
    if (pageId === 'works') setTimeout(window.loadBooks, 100);
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

// BOOKS LOADING FUNCTION
window.loadBooks = function() {
    console.log('Emergency loadBooks called');
    const worksGrid = document.querySelector('.works-grid');
    if (!worksGrid) return;
    
    const books = [
        {title: "Blood Howls", subtitle: "When ancient blood awakens, the hunt begins.", description: "Kael Thorne's twenty-fifth birthday was supposed to be ordinary—dinner with family, maybe a call from his sister. Instead, it becomes the night his parents die and a supernatural assassin called the Hunter comes to claim what flows in his veins."},
        {title: "Forgotten Son", subtitle: "When the dead whisper warnings, a god's son must choose between love and cosmic order.", description: "Christos Thanatos has spent twenty-six years hiding in plain sight—working security jobs and pretending the voices of the dead are just background noise. The son of Hades should be ruling the underworld, but he's chosen the mortal world instead."},
        {title: "Out of Time", subtitle: "When a prince is murdered and hung like a scarecrow, the killer leaves behind more than a corpse.", description: "Cael Ward Corbin has spent years hiding what he is: a memory-binder caught between the Seelie and Unseelie Courts. When Prince Alarion is found crucified with the forbidden sigil of the Outriders, Cael's investigation unearths a conspiracy."},
        {title: "Which Way the Wind Blows", subtitle: "In the shadows between light and darkness, a bastard prince must choose his crown.", description: "When Veraden—son of the ruthless Queen Mab—rescues Lord Calendreth from an Unseelie dungeon, he triggers a war that will shatter the ancient balance between the courts."},
        {title: "The Descent - Book 1", subtitle: "Born from fire and hidden in shadow, Lucien Graves never knew he was heir to a throne built on blood.", description: "Bartending in the vampire-owned clubs of Kharvas, Lucien lives quietly until ancient relics begin awakening in his presence. When he discovers his true identity as the son of murdered vampire royalty, he's thrust into a war."},
        {title: "The Descent: Ash Reborn - Book 2", subtitle: "The fire within him was never meant to be carried by the living.", description: "Lucien Thorne awakens to a terrible truth—he died, and the Sixth Relic brought him back. Now he must confront the Council's final weapons while discovering that he is no longer merely a relic-bearer, but a living artifact himself."}
    ];
    
    worksGrid.innerHTML = books.map(book => `<div class="book-card" style="opacity:1;transform:translateY(0);"><h3 class="book-title">${book.title}</h3><p class="book-subtitle">${book.subtitle}</p><p class="book-description">${book.description}</p></div>`).join('');
    console.log('Books loaded successfully - ' + books.length + ' books');
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
    
    // Load books immediately if on works page
    const worksPage = document.getElementById('works');
    if (worksPage && worksPage.classList.contains('active')) {
        setTimeout(window.loadBooks, 100);
    }
    
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
    
    if (pageId === 'works') {
        console.log('Loading books for works page');
        setTimeout(window.loadBooks, 100);
    } else if (pageId === 'chat') {
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

// Add CSS for book animations
const bookStyle = document.createElement('style');
bookStyle.textContent = '.book-card{opacity:0;transform:translateY(30px);transition:opacity 0.5s ease,transform 0.5s ease;}';
document.head.appendChild(bookStyle);

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
    logout: typeof window.logout,
    loadBooks: typeof window.loadBooks
});