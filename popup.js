document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('exportBtn');
    const formatSelect = document.getElementById('format');
    const statusDiv = document.getElementById('status');
    const encryptCheck = document.getElementById('encryptCheck');
    const passwordWrapper = document.getElementById('passwordWrapper');
    const passwordInput = document.getElementById('passwordInput');
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');
    const matchStatus = document.getElementById('matchStatus');
    const messageListEl = document.getElementById('messageList');
    const selectedCountEl = document.getElementById('selectedCount');
    const searchInput = document.getElementById('searchInput');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const selectUserBtn = document.getElementById('selectUserBtn');
    const selectLumoBtn = document.getElementById('selectLumoBtn');
    const deselectAllBtn = document.getElementById('deselectAllBtn');
    const tooltipCheck = document.getElementById('tooltipCheck');
    const btnText = exportBtn.querySelector('.btn-text');
    const loader = exportBtn.querySelector('.loader');
    const floatingTooltip = document.getElementById('floatingTooltip');

    let allMessages = [];
    let selectedIndices = new Set();
    let currentFilter = '';
    let tooltipTimeout = 0;
    let isMouseOverTooltip = false;


    const resizeBtn = document.getElementById('resizeBtn');
    const resizeIcon = document.getElementById('resizeIcon');
    let isLarge = false;

    const SMALL_WIDTH = 420;
    const SMALL_HEIGHT = 550;
    const LARGE_WIDTH = 950;
    const LARGE_HEIGHT = 800;

    const toggleResize = () => {
        isLarge = !isLarge;
        
        if (isLarge) {
            document.body.classList.add('large-mode');
            resizeIcon.textContent = '✕'; 
            resizeBtn.title = "Restore Small Size";
            
            window.resizeTo(LARGE_WIDTH, LARGE_HEIGHT);
        } else {
            document.body.classList.remove('large-mode');
            resizeIcon.textContent = '⛶'; 
            resizeBtn.title = "Expand Window";
            
            window.resizeTo(SMALL_WIDTH, SMALL_HEIGHT);
        }
    };

    if (resizeBtn) {
        resizeBtn.addEventListener('click', toggleResize);
    }





    const settingsBtn = document.getElementById('settingsBtn');
    const aboutModal = document.getElementById('aboutModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (settingsBtn && aboutModal) {
        settingsBtn.addEventListener('click', () => {
            aboutModal.classList.add('active');
        });

        closeModalBtn.addEventListener('click', () => {
            aboutModal.classList.remove('active');
        });

        aboutModal.addEventListener('click', (e) => {
            if (e.target === aboutModal) {
                aboutModal.classList.remove('active');
            }
        });
    }






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

    const scanPage = async () => {
        messageListEl.innerHTML = '<div class="loading-list">Scanning chat...</div>';
        
        const script = `
            (function() {
                const messages = [];
                const allContainers = document.querySelectorAll('.assistant-msg-container, .user-msg-container');
                allContainers.forEach(container => {
                    const isUser = container.classList.contains('user-msg-container');
                    let content = '';
                    if (isUser) {
                        const textElement = container.querySelector('.whitespace-pre-line');
                        if (textElement) content = textElement.textContent.trim();
                    } else {
                        const textContainer = container.querySelector('.progressive-markdown-content');
                        if (textContainer) {
                            const clone = textContainer.cloneNode(true);
                            const thinkingPath = clone.querySelector('.thinking-path');
                            if (thinkingPath) thinkingPath.remove();
                            const actionToolbar = clone.querySelector('.action-toolbar');
                            if (actionToolbar) actionToolbar.remove();
                            content = clone.textContent.trim();
                        }
                    }
                    if (content) {
                        messages.push({
                            role: isUser ? 'user' : 'assistant',
                            content: content
                        });
                    }
                });
                return messages;
            })();
        `;

        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            const result = await browser.tabs.executeScript(tab.id, { code: script });
            
            if (result && result[0]) {
                allMessages = result[0];
                renderList();
            } else {
                messageListEl.innerHTML = '<div class="loading-list" style="color:#ff6b6b">No messages found. Are you on a chat page?</div>';
            }
        } catch (err) {
            messageListEl.innerHTML = '<div class="loading-list" style="color:#ff6b6b">Error scanning page.</div>';
            console.error(err);
        }
    };

    const renderList = () => {
        messageListEl.innerHTML = '';
        
        if (allMessages.length === 0) {
            messageListEl.innerHTML = '<div class="loading-list">No messages found.</div>';
            updateCount();
            return;
        }

        const filterLower = currentFilter.toLowerCase();
        const tooltipsEnabled = tooltipCheck.checked;

        allMessages.forEach((msg, index) => {
            const matchesFilter = filterLower === '' || 
                                  msg.content.toLowerCase().includes(filterLower) ||
                                  msg.role.toLowerCase().includes(filterLower);

            const item = document.createElement('div');
            item.className = 'list-item';
            item.dataset.index = index;
            
            if (!matchesFilter) {
                item.classList.add('hidden');
            }
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = selectedIndices.has(index);
            checkbox.dataset.index = index;
            
            if (!matchesFilter) {
                checkbox.disabled = true;
            }
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'list-item-content';
            
            const roleSpan = document.createElement('div');
            roleSpan.className = `list-item-role ${msg.role}`;
            roleSpan.textContent = msg.role === 'user' ? 'You' : 'Lumo';
            
            const textSpan = document.createElement('div');
            textSpan.className = 'list-item-content-text';
            textSpan.textContent = msg.content.substring(0, 60) + (msg.content.length > 60 ? '...' : '');
            
            contentDiv.appendChild(roleSpan);
            contentDiv.appendChild(textSpan);
            item.appendChild(checkbox);
            item.appendChild(contentDiv);
            
            if (tooltipsEnabled) {
                item.addEventListener('mouseenter', () => {
                    if (!matchesFilter) return;
                    clearTimeout(tooltipTimeout);
                    
                    let displayContent = msg.content
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    
                    if (filterLower) {
                        const regex = new RegExp('(' + filterLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
                        displayContent = displayContent.replace(regex, '<span class="highlight-match">$1</span>');
                    }
                    
                    floatingTooltip.innerHTML = `<div class="tooltip-role ${msg.role}">${msg.role === 'user' ? 'You' : 'Lumo'}</div><div class="tooltip-text">${displayContent}</div>`;
                    floatingTooltip.classList.add('visible');
                     
                    const rect = item.getBoundingClientRect();
                    let top = rect.bottom + 5;
                    let left = rect.left + 30;
                
                    if (left + 340 > window.innerWidth) {
                    left = window.innerWidth - 350;
                    }
                    if (left < 5) left = 5;
                    if (top + 400 > window.innerHeight) {
                    top = rect.top - 410;
                    }
                    if (top < 5) top = 5;                    
                    
                    floatingTooltip.style.top = top + 'px';
                    floatingTooltip.style.left = left + 'px';
                    });
                
                item.addEventListener('mouseleave', () => {
                    tooltipTimeout = setTimeout(() => {
                        if (!isMouseOverTooltip) floatingTooltip.classList.remove('visible');
                    }, 100);
                });
            }
            
            item.addEventListener('click', (e) => {
                if (e.target === checkbox) return;
                
                if (matchesFilter) {
                    checkbox.checked = !checkbox.checked;
                    toggleSelection(index, checkbox.checked);
                }
            });
            
            checkbox.addEventListener('change', () => {
                if (matchesFilter) {
                    toggleSelection(index, checkbox.checked);
                }
            });
            
            messageListEl.appendChild(item);
        });
        
        updateCount();
    };

    if (tooltipCheck.checked) {
        floatingTooltip.addEventListener('mouseenter', () => {
            isMouseOverTooltip = true;
            clearTimeout(tooltipTimeout);
        });

        floatingTooltip.addEventListener('mouseleave', () => {
            isMouseOverTooltip = false;
            floatingTooltip.classList.remove('visible');
        });

        document.addEventListener('click', (e) => {
            if (floatingTooltip.classList.contains('visible')) {
                if (!floatingTooltip.contains(e.target)) {
                    floatingTooltip.classList.remove('visible');
                }
            }
        });
    }

    tooltipCheck.addEventListener('change', () => {
        renderList(); 
    });

    const toggleSelection = (index, isSelected) => {
        if (isSelected) {
            selectedIndices.add(index);
        } else {
            selectedIndices.delete(index);
        }
        updateCount();
    };

        const updateCount = () => {
        selectedCountEl.textContent = `${selectedIndices.size} message${selectedIndices.size !== 1 ? 's' : ''} selected`;
        exportBtn.disabled = selectedIndices.size === 0;
        if (selectedIndices.size === 0) {
            exportBtn.querySelector('.btn-text').textContent = 'Select Messages';
        } else {
            exportBtn.querySelector('.btn-text').textContent = 'Export Selected';
        }

        const statsEl = document.getElementById('exportStats');
        if (selectedIndices.size === 0) {
            statsEl.textContent = '';
            return;
        }

        const selectedMsgs = Array.from(selectedIndices).map(i => allMessages[i]);
        const totalWords = selectedMsgs.reduce((sum, m) => sum + m.content.split(/\s+/).filter(w => w).length, 0);
        const jsonSize = new Blob([JSON.stringify(selectedMsgs)]).size;
        const sizeKB = (jsonSize / 1024).toFixed(1);

        statsEl.textContent = `${totalWords.toLocaleString()} words · ${sizeKB} KB`;
    };



    const selectAllVisible = () => {
        const items = messageListEl.children;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.classList.contains('hidden')) {
                const index = parseInt(item.querySelector('input').dataset.index);
                selectedIndices.add(index);
                item.querySelector('input').checked = true;
            }
        }
        updateCount();
    };

    const selectUserVisible = () => {
        selectedIndices.clear();
        const items = messageListEl.children;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.classList.contains('hidden')) {
                const index = parseInt(item.querySelector('input').dataset.index);
                const msg = allMessages[index];
                if (msg.role === 'user') {
                    selectedIndices.add(index);
                    item.querySelector('input').checked = true;
                } else {
                    item.querySelector('input').checked = false;
                }
            }
        }
        updateCount();
    };

    const selectLumoVisible = () => {
        selectedIndices.clear();
        const items = messageListEl.children;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.classList.contains('hidden')) {
                const index = parseInt(item.querySelector('input').dataset.index);
                const msg = allMessages[index];
                if (msg.role === 'assistant') {
                    selectedIndices.add(index);
                    item.querySelector('input').checked = true;
                } else {
                    item.querySelector('input').checked = false;
                }
            }
        }
        updateCount();
    };

    const deselectAll = () => {
        selectedIndices.clear();
        const items = messageListEl.children;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const checkbox = item.querySelector('input');
            if (!item.classList.contains('hidden')) {
                checkbox.checked = false;
            }
        }
        updateCount();
    };

    searchInput.addEventListener('input', (e) => {
        currentFilter = e.target.value;
        renderList();
    });

    selectAllBtn.addEventListener('click', selectAllVisible);
    selectUserBtn.addEventListener('click', selectUserVisible);
    selectLumoBtn.addEventListener('click', selectLumoVisible);
    deselectAllBtn.addEventListener('click', deselectAll);

    exportBtn.addEventListener('click', async () => {
        if (selectedIndices.size === 0) {
            setStatus('Please select at least one message.', 'error');
            return;
        }

        const format = formatSelect.value;
        const isEncrypted = encryptCheck.checked;
        const password = passwordInput.value.trim();

        if (isEncrypted && !password) {
            setStatus('Please enter a password.', 'error');
            return;
        }
        if (isEncrypted && password.length < 8) {
            setStatus('Password must be at least 8 characters.', 'error');
            return;
        }
        if (isEncrypted && password !== confirmPasswordInput.value.trim()) {
            setStatus('Passwords do not match.', 'error');
            return;
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

            const timestamp = new Date().toISOString().slice(0, 10);
            let content, mimeType, extension, filename;

            if (isEncrypted) {
                const filteredMessages = Array.from(selectedIndices).map(i => allMessages[i]);
                const jsonString = JSON.stringify({
                    exportedAt: new Date().toISOString(),
                    totalMessages: filteredMessages.length,
                    messages: filteredMessages
                });
                const encryptedBuffer = await encryptData(jsonString, password);
                content = encryptedBuffer;
                mimeType = 'application/octet-stream';
                extension = 'json.enc';
                filename = `lumo-chat-encrypted-${timestamp}.${extension}`;
            } else {
                const filteredMessages = Array.from(selectedIndices).map(i => allMessages[i]);
                if (format === '2') {
                    content = filteredMessages.map(m => `[${m.role.toUpperCase()}]:\n${m.content}\n`).join('\n---\n');
                    mimeType = 'text/plain';
                    extension = 'txt';
                } else if (format === '3') {
                    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Lumo Chat Export</title><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6;background:#fafafa}.message{margin-bottom:1.5rem;padding:1rem;border-radius:8px}.user{background:#e3f2fd}.assistant{background:#f5f5f5}.role{font-weight:bold;margin-bottom:0.5rem;color:#555;text-transform:uppercase;font-size:12px}.content{white-space:pre-wrap}</style></head><body><h1>Lumo Chat Export - ${timestamp}</h1>`;
                    filteredMessages.forEach(m => {
                        const safeContent = m.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        html += `<div class="message ${m.role}"><div class="role">${m.role.toUpperCase()}</div><div class="content">${safeContent}</div></div>\n`;
                    });
                    html += '</body></html>';
                    content = html;
                    mimeType = 'text/html';
                    extension = 'html';
                } else {
                    content = JSON.stringify({
                        exportedAt: new Date().toISOString(),
                        totalMessages: filteredMessages.length,
                        messages: filteredMessages
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
                ? `Encrypted and exported ${selectedIndices.size} messages!` 
                : `Exported ${selectedIndices.size} messages successfully!`;
            setStatus(msg, 'success');

        } catch (error) {
            console.error(error);
            setStatus('Error: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    });

    scanPage();
});
