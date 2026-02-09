# Backend Deployment Guide (VPS)

This guide provides step-by-step instructions for deploying the Node.js backend to a Virtual Private Server (VPS) like DigitalOcean, AWS EC2, or Linode.

## Prerequisites

Ensure your VPS is running a Linux distribution (Ubuntu 20.04/22.04 LTS recommended).

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js & npm
Use NVM (Node Version Manager) or install directly. Recommended Node.js version: **v20.x** (or compatible with your local env).

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```
Verify installation:
```bash
node -v
npm -v
```

### 3. Install Git (if not installed)
```bash
sudo apt install git -y
```

### 4. Install Global Tools
Install PM2 (Process Manager) to keep the app running.
```bash
sudo npm install -g pm2
```

---

## Deployment Steps

### 1. Clone the Repository
Clone your project to the server.
```bash
git clone <YOUR_REPO_URL>
cd <YOUR_PROJECT_FOLDER>/backend
```
*Alternatively, you can upload your `backend` folder using SCP or FileZilla.*

### 2. Install Dependencies
Navigate to the backend directory and install packages.
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file based on the example.
```bash
cp .env.example .env
nano .env
```
Fill in your production details (MongoDB URI, API Keys, etc.):
```env
PORT=3000
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/paramsukh
JWT_SECRET=your_secure_production_secret
...
```
*Press `Ctrl+X`, then `Y`, then `Enter` to save and exit.*

### 4. Start the Application with PM2
Start the application using the start script or entry point.
```bash
pm2 start src/index.js --name "backend-api"
```
*Or if you prefer using npm script:*
```bash
pm2 start npm --name "backend-api" -- start
```

Save the PM2 list so it restarts on reboot:
```bash
pm2 save
pm2 startup
```
(Run the command output by `pm2 startup`)

---

## Nginx Reverse Proxy Setup (Recommended)

Instead of exposing port 3000 directly, use Nginx as a reverse proxy to handle requests on port 80/443.

### 1. Install Nginx
```bash
sudo apt install nginx -y
```

### 2. Configure Nginx
Create a new configuration file.
```bash
sudo nano /etc/nginx/sites-available/backend
```

Add the following configuration (replace `your_domain.com` with your actual domain or IP):

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com; # Or your VPS IP address

    location / {
        proxy_pass http://localhost:3000; # Port app is running on
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable the Configuration
Link the file to `sites-enabled`.
```bash
sudo ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/
```

Test the configuration:
```bash
sudo nginx -t
```
Restart Nginx:
```bash
sudo systemctl restart nginx
```

---

## SSL Setup (HTTPS) - Optional but Recommended

If you have a domain pointing to your VPS, use Certbot to get a free SSL certificate.

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```
Follow the prompts to enable HTTPS redirect.

---

## Maintenance & Logs

- **View Logs:** `pm2 logs backend-api`
- **Restart App:** `pm2 restart backend-api`
- **Stop App:** `pm2 stop backend-api`
- **Monitor:** `pm2 monit`
