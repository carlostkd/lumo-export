document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('exportBtn');
    const formatSelect = document.getElementById('format');
    const statusDiv = document.getElementById('status');
    const encryptCheck = document.getElementById('encryptCheck');
    const passwordWrapper = document.getElementById('passwordWrapper');
    const passwordInput = document.getElementById('passwordInput');
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');
    const matchStatus = document.getElementById('matchStatus');
    const btnText = exportBtn.querySelector('.btn-text');
    const loader = exportBtn.querySelector('.loader');

    const setStatus = (message, type = '') => {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
        if (message) {
            setTimeout(() => {
                statusDiv.textContent = '';
                statusDiv.className = 'status';
            }, 4000);
        }
    };

    const setLoading = (loading) => {
        exportBtn.disabled = loading;
        if (loading) {
            exportBtn.classList.add('loading');
        } else {
            exportBtn.classList.remove('loading');
        }
    };

    const checkPasswordMatch = () => {
        const pass1 = passwordInput.value;
        const pass2 = confirmPasswordInput.value;
        
        if (pass1 && pass2) {
            if (pass1 === pass2) {
                matchStatus.classList.add('hidden');
                return true;
            } else {
                matchStatus.classList.remove('hidden');
                return false;
            }
        } else {
            matchStatus.classList.add('hidden');
            return false;
        }
    };

    encryptCheck.addEventListener('change', () => {
        if (encryptCheck.checked) {
            passwordWrapper.classList.remove('hidden');
            passwordInput.focus();
        } else {
            passwordWrapper.classList.add('hidden');
            passwordInput.value = '';
            confirmPasswordInput.value = '';
            matchStatus.classList.add('hidden');
        }
    });

    passwordInput.addEventListener('input', checkPasswordMatch);
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);

    const deriveKey = async (password, salt) => {
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );
        return window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt"]
        );
    };

    const encryptData = async (dataString, password) => {
        const enc = new TextEncoder();
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const key = await deriveKey(password, salt);
        const encodedData = enc.encode(dataString);
        const encryptedContent = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key,
            encodedData
        );

        const packageData = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
        packageData.set(salt, 0);
        packageData.set(iv, salt.length);
        packageData.set(new Uint8Array(encryptedContent), salt.length + iv.length);

        return packageData;
    };

    exportBtn.addEventListener('click', async () => {
        const format = formatSelect.value;
        const isEncrypted = encryptCheck.checked;
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (isEncrypted) {
            if (!password) {
                setStatus('Please enter a password.', 'error');
                return;
            }
            if (password.length < 8) {
                setStatus('Password must be at least 8 characters.', 'error');
                return;
            }
            if (password !== confirmPassword) {
                setStatus('Passwords do not match.', 'error');
                return;
            }
        }

        setStatus('', '');
        setLoading(true);

        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

            if (!tab.url.includes('lumo.proton.me')) {
                setStatus('Please open a Lumo chat page first.', 'error');
                setLoading(false);
                return;
            }

            const script = `
                (function() {
                    const messages = [];
                    const allContainers = document.querySelectorAll('.assistant-msg-container, .user-msg-container');
                    
                    allContainers.forEach(container => {
                        const isUser = container.classList.contains('user-msg-container');
                        
                        if (isUser) {
                            const textElement = container.querySelector('.whitespace-pre-line');
                            if (textElement && textElement.textContent.trim()) {
                                messages.push({
                                    role: 'user',
                                    content: textElement.textContent.trim()
                                });
                            }
                        } else {
                            const textContainer = container.querySelector('.progressive-markdown-content');
                            if (textContainer) {
                                const clone = textContainer.cloneNode(true);
                                const thinkingPath = clone.querySelector('.thinking-path');
                                if (thinkingPath) thinkingPath.remove();
                                const actionToolbar = clone.querySelector('.action-toolbar');
                                if (actionToolbar) actionToolbar.remove();
                                const text = clone.textContent.trim();
                                if (text) {
                                    messages.push({
                                        role: 'assistant',
                                        content: text
                                    });
                                }
                            }
                        }
                    });

                    return { success: true, count: messages.length, messages: messages };
                })();
            `;

            const result = await browser.tabs.executeScript(tab.id, { code: script });

            if (result && result[0] && result[0].success) {
                const data = result[0];
                const timestamp = new Date().toISOString().slice(0, 10);
                let content, mimeType, extension, filename;

                if (isEncrypted) {
                    const jsonString = JSON.stringify({
                        exportedAt: new Date().toISOString(),
                        totalMessages: data.count,
                        messages: data.messages
                    });
                    
                    const encryptedBuffer = await encryptData(jsonString, password);
                    content = encryptedBuffer;
                    mimeType = 'application/octet-stream';
                    extension = 'json.enc';
                    filename = `lumo-chat-encrypted-${timestamp}.${extension}`;
                } else {
                    if (format === '2') {
                        content = data.messages.map(m => `[${m.role.toUpperCase()}]:\n${m.content}\n`).join('\n---\n');
                        mimeType = 'text/plain';
                        extension = 'txt';
                    } else if (format === '3') {
                        let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Lumo Chat Export</title>
<style>
body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6;background:#fafafa}
.message{margin-bottom:1.5rem;padding:1rem;border-radius:8px}
.user{background:#e3f2fd}
.assistant{background:#f5f5f5}
.role{font-weight:bold;margin-bottom:0.5rem;color:#555;text-transform:uppercase;font-size:12px}
.content{white-space:pre-wrap}
</style>
</head>
<body>
<h1>Lumo Chat Export - ${timestamp}</h1>
`;
                        data.messages.forEach(m => {
                            const safeContent = m.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                            html += `<div class="message ${m.role}"><div class="role">${m.role.toUpperCase()}</div><div class="content">${safeContent}</div></div>\n`;
                        });
                        html += '</body>\n</html>';
                        content = html;
                        mimeType = 'text/html';
                        extension = 'html';
                    } else {
                        content = JSON.stringify({
                            exportedAt: new Date().toISOString(),
                            totalMessages: data.count,
                            messages: data.messages
                        }, null, 2);
                        mimeType = 'application/json';
                        extension = 'json';
                    }
                    filename = `lumo-chat-export-${timestamp}.${extension}`;
                }

                const blob = new Blob([content], { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                const msg = isEncrypted 
                    ? `Encrypted and exported ${data.count} messages!` 
                    : `Exported ${data.count} messages successfully!`;
                setStatus(msg, 'success');
            } else {
                setStatus('Something went wrong. Try refreshing the page.', 'error');
            }

        } catch (error) {
            console.error(error);
            setStatus('Error: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    });
});
