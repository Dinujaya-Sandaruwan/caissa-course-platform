# Nginx Configuration — Block Direct File Access

To prevent unauthorized direct HTTP access to uploaded files, update your Nginx configuration to block the `/uploads/` path and proxy all file access through the authenticated Next.js API route.

## Configuration

Add this **before** your existing `location /` proxy block:

```nginx
# Block direct access to uploaded files
location /uploads/ {
    deny all;
    return 403;
}
```

Your full server block should look like:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Block direct access to uploads
    location /uploads/ {
        deny all;
        return 403;
    }

    # Proxy all requests to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;

        # Increase limits for file uploads
        client_max_body_size 2G;
        proxy_read_timeout 600;
    }
}
```

## How it works

1. All uploaded files are stored in `public/uploads/` on disk
2. Direct HTTP access to `/uploads/` is blocked by Nginx (403 Forbidden)
3. Files are accessed via `GET /api/files/{path}` which:
   - Verifies user authentication
   - Checks role-based permissions per file type
   - Streams the file with proper MIME type headers

## Permission Matrix

| File Type      | Path Pattern                      | Who Can Access                       |
| -------------- | --------------------------------- | ------------------------------------ |
| Receipts       | `/api/files/receipts/*`           | Managers only                        |
| Course Videos  | `/api/files/courses/{courseId}/*` | Enrolled students, coaches, managers |
| Profile Photos | `/api/files/{filename}`           | Any authenticated user               |

## Apply Changes

```bash
sudo nginx -t          # Test configuration
sudo systemctl reload nginx  # Apply changes
```
