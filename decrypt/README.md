# 🔓 Lumo Chat Decryptor

A secure, client-side tool to decrypt and view chat archives exported by the Lumo Chat Export Firefox extension.

## 🛡️ How It Works

When you export a Lumo chat with the "Encrypt with Password" option, the extension creates a `.json.enc` file. This file is encrypted using AES-256-GCM with a key derived from your password via PBKDF2.

This tool reverses that process entirely in your browser. No data is ever sent to a server.

## New added a python script to Encrypt/Decrypt the chats without any web dependencies.

Install the dependencies firts:

```
pip install cryptography
```

## 🚀 Usage

1. Open the decryptor page.
2. Drag and drop your `.json.enc` file into the upload zone (or click to browse).
3. Enter the password you used during export.
4. Click "Unlock Chat".
5. View your messages or download them as JSON or Plain Text.

## 🔒 Security Features

- Zero Server Communication: All decryption happens locally in your browser using the Web Crypto API.
- Strong Encryption: Uses AES-256-GCM with PBKDF2 (100,000 iterations, SHA-256).
- Unique Salts: Every file has a unique salt and IV, ensuring identical chats produce different encrypted outputs.
- No Logs: Passwords are never stored, logged, or transmitted.

## 🌐 Use It Online

You can use the hosted version directly in your browser without installation.

Link: https://carlostkd.ch/lumo/export/decrypt


## 🏠 Self-Host

For maximum privacy, you can host this tool on your own infrastructure.

### Requirements
- Any static web server (Nginx, Apache, Caddy, GitHub Pages, Netlify, etc.).
- HTTPS is required for the Web Crypto API to function correctly.
- No backend code (PHP, Node.js, Python) is needed.

### Steps
1. Download the lumo-decryptor folder.
2. Upload the contents to your web server's public directory.
3. Access the index.html via HTTPS.

### Nginx Configuration Example
Create a server block in your Nginx config:

server {
    listen 443 ssl;
    server_name decrypt.yourdomain.com;
    root /var/www/lumo-decryptor;
    index index.html;
    
    # Add your SSL certificate paths here
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        try_files $uri $uri/ =404;
    }
}

### Docker Deployment
Create a file named Dockerfile with this content:

FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80

Then build and run:
docker build -t lumo-decryptor .
docker run -d -p 8080:80 lumo-decryptor

## 📂 File Format

The .json.enc file structure:
- Bytes 0-15: PBKDF2 Salt (16 bytes)
- Bytes 16-27: AES-GCM IV (12 bytes)
- Bytes 28+: Encrypted Payload

The decrypted payload is a standard JSON object containing exportedAt, totalMessages, and a messages array.

## 🖥️ Browser Compatibility

- Chrome 
- Firefox 
- Safari 
- Edge (is this a browser?)
- Any browser supporting the Web Crypto API.

## 📜 License

MIT License. Feel free to use, modify, and distribute.

---

Part of the Lumo Chat Export ecosystem.
