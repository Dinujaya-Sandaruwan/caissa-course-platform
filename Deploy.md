# Caissa Course Platform: Next.js Deployment Guide

This document outlines the current state of your VPS architecture and provides a step-by-step guide to properly deploy this Next.js application to your production server without breaking the existing SSL or process structures.

## 1. Current Server Architecture Overview

Based on an investigation of your VPS (`167.71.195.201`), here is how your environment is currently built:

- **Nginx (Web Server & Proxy):**
  - Configuration files are located in `/etc/nginx/sites-available/` and `/etc/nginx/sites-enabled/`.
  - Your 3 React sites (`caissachess.org`, `coach.caissachess.org`, `lms.caissachess.org`) are currently deployed as **Static SPAs**. Nginx serves their files directly from `/var/www/<domain>/public`.
  - Your Express backend (`api.caissachess.org`) is set up as a **Reverse Proxy**. Nginx forwards web traffic to `http://127.0.0.1:4000`.
- **PM2 (Process Manager):**
  - Manages continuous background Node.js processes.
  - Currently running `caissachess-api` (your Express backend) and `tournament_fetcher`.
- **SSL (Certbot):**
  - Your certificates are managed perfectly by Certbot. You have one consolidated certificate for `caissachess.org` that includes all your subdomains (`api`, `coach`, `lms`).
  - SSL logic is automatically injected at the bottom of every Nginx config block.

## 2. Preparing the Next.js App for Deployment

Since this new platform is built with **Next.js** (which utilizes a Node.js server for Server-Side Rendering), it cannot be just dropped into an Nginx `public` folder like your older React SPAs.

Instead, it must be run as a continuous Node.js process using **PM2** (just like your Express API), and **Nginx** needs to be configured to forward traffic to it (Reverse Proxy).

### Step 2.1: Local Build

1. On your local machine, open your terminal in the Next.js root directory and build the application:
   ```bash
   npm run build
   ```
2. Create a `.zip` archive containing the following crucial files and folders from your workspace:
   - `.next/` (the entire build output folder)
   - `public/` (static assets)
   - `package.json`
   - `package-lock.json`
   - `next.config.ts`
   - `.env` (Create this file with your production environment variables, explicitly including your MongoDB URI)

### Step 2.2: Upload Files via FTP

1. Connect to your VPS using your FTP client.
2. Navigate to your web directory: `/var/www/`.
3. Upload and extract all the prepared files (from step 2.1) into this new directory (`/var/www/learn.caissachess.org`).

## 3. Server-Side Configuration (SSH)

Now, authenticate into your VPS over SSH:

```bash
ssh root@167.71.195.201
```

### Step 3.1: Install Dependencies

Navigate to the directory where you uploaded the files via FTP and install production NPM packages.

```bash
cd /var/www/learn.caissachess.org   # Use the exact folder name you created
npm install --production
```

### Step 3.2: Start Next.js App with PM2

Start the Next.js application using PM2 on an available port (e.g., `3000`).

```bash
pm2 start npm --name "caissa-nextjs" -- run start -- -p 3000
```

_(If port 3000 is occupied, you can change it to `3001` or another open port)._

Save the updated PM2 process list so the Next.js app starts automatically if the server reboots:

```bash
pm2 save
```

### Step 3.3: Configure Nginx to route traffic

You next need to tell Nginx to forward visitors from the outside world into your new PM2 Next.js process on port 3000. Since this is a **new domain**, we must create a new Nginx config file.

1. Create a new Nginx configuration file for your domain (`learn.caissachess.org`):

   ```bash
   nano /etc/nginx/sites-available/learn.caissachess.org
   ```

2. **PASTE** the following configuration block into the file:

   ```nginx
   server {
       listen 80;
       server_name learn.caissachess.org;

       # The Reverse Proxy block to point to Next.js
       location / {
           proxy_pass http://127.0.0.1:3000; # Must match the port defined in PM2
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

   _(Note: This is HTTP only for now. We will use Certbot in the next step to automatically add SSL to this block.)_

3. Save the file and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

4. Enable the new site by creating a symlink to the `sites-enabled` directory:

   ```bash
   ln -s /etc/nginx/sites-available/learn.caissachess.org /etc/nginx/sites-enabled/
   ```

5. Test your modified Nginx configuration for any syntax errors:

   ```bash
   nginx -t
   ```

6. If the test passes (says `syntax is ok`), reload Nginx:
   ```bash
   systemctl reload nginx
   ```

## 4. SSL Certificates (Crucial Step)

Because `learn.caissachess.org` is a completely new domain, you **must** generate a new SSL certificate for it. The Let's Encrypt certificates for your other domains will not cover this one automatically.

Run Certbot specifically for this new domain to secure the Nginx block you just created:

```bash
certbot --nginx -d learn.caissachess.org
```

Certbot will automatically communicate with Let's Encrypt, issue the certificate, and (most importantly) it will **automatically edit** your `/etc/nginx/sites-available/learn.caissachess.org` file to enforce HTTPS (`listen 443 ssl`), routing all port 80 traffic to port 443.

Choose "Redirect" if it asks if you'd like to redirect all HTTP traffic to HTTPS.

---

**Recap:**
You are shifting from a static structure to a backend-driven structure. Instead of Nginx just giving out `.html` files, Nginx acts as a middleman that passes user requests to the Next.js Server running continuously on PM2.
You can use your FTP client exactly as you have been doing — just upload the zipped build output, SSH in, and manage it through PM2!
