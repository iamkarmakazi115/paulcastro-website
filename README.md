# Paul Castro - Author Website

## Overview
Official website for Paul Castro, featuring his literary works, biography, and interactive community features.

## Features
- **Author Portfolio**: Showcasing current works in progress
- **About Section**: Professional background and interests
- **Social Integration**: Live Facebook feed from author page
- **Live Chat System**: Password-protected video/text chat rooms
- **Admin Dashboard**: Complete control over chat rooms and user management

## Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Real-time Communication**: WebRTC & Socket.io
- **Hosting**: GitHub Pages (Frontend) + Local Server (Backend)
- **SSL**: Let's Encrypt
- **CDN/DNS**: Cloudflare

## Project Structure
```
├── index.html          # Home page
├── about.html          # About the author
├── works.html          # Literary works showcase
├── social.html         # Social media integration
├── chat.html           # Live chat interface
├── admin.html          # Admin dashboard (hidden)
├── css/                # Stylesheets
├── js/                 # JavaScript files
└── assets/             # Images and media
```

## Setup Instructions

### Frontend (GitHub Pages)
1. Repository is configured with custom domain: paulcastro.karmakazi.org
2. CNAME file points to the custom domain
3. Cloudflare DNS configured for proxied A records

### Backend (Local Server)
- **Server IP**: 192.168.0.22
- **Public IP**: 76.143.43.18
- **Ports**: 80 (HTTP), 443 (HTTPS), 3001 (API)
- **SSL Certificate**: Let's Encrypt for karmakazi.org

## Contact Information
- **Phone**: (346) 203-0833
- **Email**: paul_castro@karmakazi.org
- **Facebook**: [Author Page](https://www.facebook.com/profile.php?id=61579899121583)

## Security Features
- Password-protected live chat system
- IP-based blocking for removed users
- Admin-only access controls
- Secure WebRTC implementation

## Books in Development
- Blood Howls
- Forgotten Son
- Out of Time
- Which Way the Wind Blows
- The Descent (Book 1)
- The Descent: Ash Reborn (Book 2)

## License
© 2024 Paul Castro. All rights reserved.

## Author
Paul Castro - IT Network Administrator & Author

---
*Built with passion for literature and technology*