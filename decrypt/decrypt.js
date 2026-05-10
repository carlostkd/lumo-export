document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const passwordSection = document.getElementById('passwordSection');
    const decryptPassword = document.getElementById('decryptPassword');
    const decryptBtn = document.getElementById('decryptBtn');
    const passwordHint = document.getElementById('passwordHint');
    const resultSection = document.getElementById('resultSection');
    const previewBox = document.getElementById('previewBox');
    const viewBtn = document.getElementById('viewBtn');
    const downloadJsonBtn = document.getElementById('downloadJsonBtn');
    const downloadTxtBtn = document.getElementById('downloadTxtBtn');
    let encryptedData = null;
    let decryptedData = null;
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length) handleFile(files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });
     
    function handleFile(file) {
        const existingError = document.querySelector('.file-error');
        if (existingError) existingError.remove();
        const validExtensions = ['.json.enc'];
        const fileName = file.name.toLowerCase();
        let isValid = false;
        for (const ext of validExtensions) {
            if (fileName.endsWith(ext)) {
                isValid = true;
                break;
            }
        }
      
        
        if (!isValid) {
        
             if (fileName.endsWith('.enc') && fileName.includes('.json')) {
                 isValid = true;
             }
        }
        if (!isValid) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'file-error';
            errorMsg.style.cssText = 'color: #ff4444; font-size: 0.9rem; margin-top: 1rem; font-weight: 600; text-align: center; animation: shake 0.5s;';
            errorMsg.textContent = `
 Invalid file: "${file.name}". Please upload a .json.enc file.`;
            
            if (!document.getElementById('shake-style')) {
                const style = document.createElement('style');
                style.id = 'shake-style';
                style.textContent = '@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }';
                document.head.appendChild(style);
            }
            dropZone.appendChild(errorMsg);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            encryptedData = new Uint8Array(e.target.result);
            dropZone.classList.add('hidden');
            const err = document.querySelector('.file-error');
            if (err) err.remove();
            passwordSection.classList.remove('hidden');
            decryptPassword.focus();
        };
        reader.readAsArrayBuffer(file);
    }
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
            ["decrypt"]
        );
    };
    const decryptData = async (buffer, password) => {
        const salt = buffer.slice(0, 16);
        const iv = buffer.slice(16, 28);
        const data = buffer.slice(28);
        try {
            const key = await deriveKey(password, salt);
            const decryptedContent = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv },
                key,
                data
            );
            const dec = new TextDecoder();
            return dec.decode(decryptedContent);
        } catch (err) {
            throw new Error('Invalid password or corrupted file.');
        }
    };
    decryptBtn.addEventListener('click', async () => {
        const password = decryptPassword.value.trim();
        if (!password) {
            passwordHint.textContent = 'Please enter a password.';
            passwordHint.classList.remove('hidden');
            return;
        }
        decryptBtn.disabled = true;
        passwordHint.classList.add('hidden');
        try {
            const jsonStr = await decryptData(encryptedData, password);
            decryptedData = JSON.parse(jsonStr);
            
            passwordSection.classList.add('hidden');
            resultSection.classList.remove('hidden');
            
            const preview = decryptedData.messages.slice(0, 5).map(m => 
                `[${m.role.toUpperCase()}]:\n${m.content}\n`
            ).join('\n---\n');
            
            previewBox.textContent = preview + (decryptedData.messages.length > 5 ? '\n\n... (truncated)' : '');
            
            setupDownloads();
        } catch (err) {
            passwordHint.textContent = err.message;
            passwordHint.classList.remove('hidden');
            decryptBtn.disabled = false;
        }
    });
    function setupDownloads() {
        const fullJson = JSON.stringify(decryptedData, null, 2);
        
        viewBtn.onclick = () => {
            const blob = new Blob([fullJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        };
        downloadJsonBtn.onclick = () => {
            const blob = new Blob([fullJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lumo-chat-decrypted-${Date.now()}.json`;
            a.click();
        };
        downloadTxtBtn.onclick = () => {
            const txt = decryptedData.messages.map(m => 
                `[${m.role.toUpperCase()}]:\n${m.content}\n`
            ).join('\n---\n');
            const blob = new Blob([txt], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lumo-chat-decrypted-${Date.now()}.txt`;
            a.click();
        };
    }
