// js/main.js - Main JavaScript file for all pages

// API Configuration
const API_BASE_URL = 'https://api.karmakazi.org/api';
const WS_URL = 'wss://api.karmakazi.org';

// Global utility functions
const utils = {
    // Get stored auth token
    getToken: () => localStorage.getItem('authToken'),
    
    // Set auth token
    setToken: (token) => localStorage.setItem('authToken', token),
    
    // Remove auth token
    removeToken: () => localStorage.removeItem('authToken'),
    
    // Get user data
    getUser: () => {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    },
    
    // Set user data
    setUser: (user) => localStorage.setItem('userData', JSON.stringify(user)),
    
    // Remove user data
    removeUser: () => localStorage.removeItem('userData'),
    
    // Check if user is logged in
    isLoggedIn: () => !!utils.getToken(),
    
    // Check if user is admin
    isAdmin: () => {
        const user = utils.getUser();
        return user && user.isAdmin;
    },
    
    // Make API request
    apiRequest: async (endpoint, options = {}) => {
        const token = utils.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    utils.removeToken();
                    utils.removeUser();
                    window.location.href = '/index.html';
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },
    
    // Show notification
    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#DC143C' : type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            border-radius: 5px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },
    
    // Format date
    formatDate: (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    },
    
    // Escape HTML
    escapeHtml: (text) => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
};

// Mobile menu toggle
function toggleMobileMenu() {
    const sidebar = document.getElementById('navSidebar');
    sidebar.classList.toggle('active');
}

// Request chat access
async function requestChatAccess() {
    if (utils.isLoggedIn()) {
        window.location.href = '/chat.html';
        return;
    }
    
    // Show login modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Live Chat Access</h2>
            <p>Please login or request access to join the live chat.</p>
            
            <div class="tab-buttons">
                <button class="tab-btn active" onclick="switchTab('login')">Login</button>
                <button class="tab-btn" onclick="switchTab('request')">Request Access</button>
            </div>
            
            <div id="loginTab" class="tab-content active">
                <form id="loginForm" onsubmit="handleLogin(event)">
                    <input type="text" id="username" placeholder="Username" required>
                    <input type="password" id="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
            </div>
            
            <div id="requestTab" class="tab-content">
                <form id="requestForm" onsubmit="handleAccessRequest(event)">
                    <input type="email" id="requestEmail" placeholder="Email Address" required>
                    <textarea id="requestReason" placeholder="Why would you like access?" rows="4" required></textarea>
                    <button type="submit">Submit Request</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Switch tabs in modal
function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(t => t.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));
    
    if (tab === 'login') {
        document.getElementById('loginTab').classList.add('active');
        buttons[0].classList.add('active');
    } else {
        document.getElementById('requestTab').classList.add('active');
        buttons[1].classList.add('active');
    }
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await utils.apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        utils.setToken(response.token);
        utils.setUser(response.user);
        utils.showNotification('Login successful!', 'success');
        
        // Remove modal
        document.querySelector('.modal').remove();
        
        // Redirect to chat
        setTimeout(() => {
            window.location.href = '/chat.html';
        }, 1000);
        
    } catch (error) {
        utils.showNotification('Login failed. Please check your credentials.', 'error');
    }
}

// Handle access request
async function handleAccessRequest(event) {
    event.preventDefault();
    
    const email = document.getElementById('requestEmail').value;
    const reason = document.getElementById('requestReason').value;
    
    try {
        await utils.apiRequest('/request-access', {
            method: 'POST',
            body: JSON.stringify({ email, reason })
        });
        
        utils.showNotification('Access request submitted successfully!', 'success');
        
        // Remove modal
        document.querySelector('.modal').remove();
        
    } catch (error) {
        utils.showNotification('Failed to submit request. Please try again.', 'error');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Add animation styles if not present
    if (!document.getElementById('animationStyles')) {
        const style = document.createElement('style');
        style.id = 'animationStyles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            
            .modal-content {
                background: linear-gradient(135deg, #2C2C2C, #1A1A1A);
                padding: 2rem;
                border-radius: 10px;
                max-width: 400px;
                width: 90%;
                position: relative;
                border: 2px solid #DC143C;
            }
            
            .modal-close {
                position: absolute;
                top: 10px;
                right: 15px;
                font-size: 28px;
                cursor: pointer;
                color: #E0E0E0;
            }
            
            .modal-close:hover {
                color: #DC143C;
            }
            
            .modal h2 {
                color: #DC143C;
                margin-bottom: 1rem;
                font-family: 'Orbitron', monospace;
            }
            
            .modal p {
                color: #E0E0E0;
                margin-bottom: 1.5rem;
            }
            
            .tab-buttons {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .tab-btn {
                flex: 1;
                padding: 0.8rem;
                background: #4A4A4A;
                color: #E0E0E0;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .tab-btn.active {
                background: #DC143C;
                color: white;
            }
            
            .tab-content {
                display: none;
            }
            
            .tab-content.active {
                display: block;
            }
            
            .modal form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .modal input,
            .modal textarea {
                padding: 0.8rem;
                background: rgba(42, 42, 42, 0.8);
                border: 1px solid #4A4A4A;
                color: #E0E0E0;
                border-radius: 5px;
                font-size: 1rem;
            }
            
            .modal button[type="submit"] {
                padding: 0.8rem;
                background: linear-gradient(45deg, #DC143C, #4A4A4A);
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            
            .modal button[type="submit"]:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 15px rgba(220, 20, 60, 0.4);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Set active navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        if (link && link.getAttribute('href') === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});