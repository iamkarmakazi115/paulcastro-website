# Paul Castro - Author Website

A personal website for Paul Castro featuring his literary works, social media integration, and live chat functionality.

## Features

- **Home Page**: Welcome page with gradient background and 3D navigation
- **About Me**: Professional background and expertise
- **My Works**: Showcase of literary works
- **Social**: Facebook page integration
- **Live Chat**: Password-protected live video/text chat with rooms
- **Admin Panel**: Hidden admin interface for user and room management

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL
- **Cache**: Redis
- **Real-time**: WebRTC for video chat
- **Hosting**: GitHub Pages (frontend), Ubuntu Server (backend)

## Setup Instructions

### Frontend (GitHub Pages)

1. Fork this repository
2. Go to Settings > Pages
3. Enable GitHub Pages from main branch
4. Add custom domain: paulcastro.karmakazi.org

### Backend (Ubuntu Server)

1. Run the database setup script:
```bash
sudo bash database-setup.sh
```

2. Configure the database:
```bash
sudo -u postgres psql -d paulcastro_db -f schema.sql
```

3. Install API dependencies:
```bash
cd /var/www/paulcastro-api
npm install
```

4. Configure environment variables:
```bash
cp api.env .env
# Edit .env file with your settings
```

5. Start the API server:
```bash
npm start
```

6. Configure Nginx:
```bash
sudo cp nginx-api.conf /etc/nginx/sites-available/paulcastro-api
sudo ln -s /etc/nginx/sites-available/paulcastro-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Cloudflare DNS Configuration

Add the following DNS records in Cloudflare:

- **A Record**: paulcastro -> GitHub Pages IP (185.199.108.153)
- **A Record**: paulcastro -> GitHub Pages IP (185.199.109.153)
- **A Record**: paulcastro -> GitHub Pages IP (185.199.110.153)
- **A Record**: paulcastro -> GitHub Pages IP (185.199.111.153)
- **A Record**: api -> Your Public IP (76.143.43.18)

### Port Forwarding

Configure your router to forward the following ports to 192.168.0.22:

- Port 443 -> 443 (HTTPS)
- Port 80 -> 80 (HTTP)
- Port 3001 -> 3001 (API)

## Admin Access

To access the admin panel, navigate to:
```
https://paulcastro.karmakazi.org/admin.html
```

Or add `?admin=secure-admin-2024` to the main URL to reveal the admin navigation.

## Default Credentials

Admin User:
- Username: JohnC
- Password: Gantz115!

## Security Notes

- Change all default passwords before deployment
- Update JWT secret in production
- Configure SSL certificates using Let's Encrypt
- Regularly update dependencies
- Monitor access logs

## License

© 2024 Paul Castro. All rights reserved.