//Vanilla Edition
document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('exportBtn');
    const formatSelect = document.getElementById('format'); 
    const customSelect = document.getElementById('customFormatSelect');
    const selectedFormatText = document.getElementById('selectedFormatText');
    const formatOptions = document.getElementById('formatOptions');
    const formatOptionsList = formatOptions.querySelectorAll('.custom-option');
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

    const extractCodeBtn = document.getElementById('extractCodeBtn');
    const codeExtractModal = document.getElementById('codeExtractModal');
    const closeCodeModalBtn = document.getElementById('closeCodeModalBtn');
    const codeListEl = document.getElementById('codeList');
    const codeCountEl = document.getElementById('codeCount');
    const selectAllCodeBtn = document.getElementById('selectAllCodeBtn');
    const deselectAllCodeBtn = document.getElementById('deselectAllCodeBtn');
    const exportCodeMdBtn = document.getElementById('exportCodeMdBtn');
    const exportCodeTxtBtn = document.getElementById('exportCodeTxtBtn');
    const logsBtn = document.getElementById('logsBtn');
    const logsModal = document.getElementById('logsModal');
    const closeLogsBtn = document.getElementById('closeLogsBtn');
    const copyLogScriptBtn = document.getElementById('copyLogScriptBtn'); 
    const copyStatusEl = document.getElementById('copyStatus');


    let extractedCodes = []; 
    
       
    const securityBtn = document.getElementById('securityBtn');
    const securityModal = document.getElementById('securityModal');
    const closeSecurityBtn = document.getElementById('closeSecurityBtn');
    const envStatusEl = document.getElementById('envStatus');
    const runEnvCheckBtn = document.getElementById('runEnvCheckBtn');
    const extListEl = document.getElementById('extList');
    const scanExtBtn = document.getElementById('scanExtBtn');
    const injectStatusEl = document.getElementById('injectStatus');
    const runInjectTestBtn = document.getElementById('runInjectTestBtn');
    const permListEl = document.getElementById('permList');
     
    const integrityStatusEl = document.getElementById('integrityStatus');
    const runIntegrityCheckBtn = document.getElementById('runIntegrityCheckBtn');




    const findReplaceCheck = document.getElementById('findReplaceCheck');
    const findReplaceWrapper = document.getElementById('findReplaceWrapper');
    const findInput = document.getElementById('findInput');
    const replaceInput = document.getElementById('replaceInput');
    const caseSensitiveCheck = document.getElementById('caseSensitiveCheck');
    const replaceCountEl = document.getElementById('replaceCount');

    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const closeHelpBtn = document.getElementById('closeHelpBtn');
    const helpBodyEl = document.getElementById('helpBody');



    let allMessages = [];
    let selectedIndices = new Set();
    let currentFilter = '';
    let tooltipTimeout = 0;
    let isMouseOverTooltip = false;
   
    let isDraggingTooltip = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragInitialLeft = 0;
    let dragInitialTop = 0;
    let currentTooltipHeader = null;
    

    formatOptionsList.forEach(opt => {
    if (opt.getAttribute('data-value') === formatSelect.value) {
    opt.classList.add('selected');
    }
    });




    const resizeBtn = document.getElementById('resizeBtn');
    const resizeIcon = document.getElementById('resizeIcon');
    let isLarge = false;

    const SMALL_WIDTH = 420;
    const SMALL_HEIGHT = 550;
    const LARGE_WIDTH = 950;
    const LARGE_HEIGHT = 800;

    const toggleResize = () => {
        isLarge = !isLarge;
        
        document.body.style.transition = 'none';
        
        if (isLarge) {
            document.body.classList.add('large-mode');
            resizeIcon.textContent = '✕'; 
            resizeBtn.title = "Restore Small Size";
        } else {
            document.body.classList.remove('large-mode');
            resizeIcon.textContent = '⛶'; 
            resizeBtn.title = "Expand Window";
        }
        
        requestAnimationFrame(() => {
            window.resizeTo(isLarge ? LARGE_WIDTH : SMALL_WIDTH, isLarge ? LARGE_HEIGHT : SMALL_HEIGHT);
            requestAnimationFrame(() => {
                document.body.style.transition = '';
            });
        });
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


        if (securityBtn && securityModal) {
        securityBtn.addEventListener('click', () => {
            securityModal.classList.remove('hidden');
            securityModal.classList.add('active');
            loadPermissions();
        });

        closeSecurityBtn.addEventListener('click', () => {
            securityModal.classList.remove('active');
            securityModal.classList.add('hidden');
        });

        securityModal.addEventListener('click', (e) => {
            if (e.target === securityModal) {
                securityModal.classList.remove('active');
                securityModal.classList.add('hidden');
            }
        });
    }



    if (helpBtn && helpModal) {
        helpBtn.addEventListener('click', () => {
            helpModal.classList.remove('hidden');
            helpModal.classList.add('active');
        });

        closeHelpBtn.addEventListener('click', () => {
            helpModal.classList.remove('active');
            helpModal.classList.add('hidden');
        });

        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.classList.remove('active');
                helpModal.classList.add('hidden');
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

    
    findReplaceCheck.addEventListener('change', () => {
        if (findReplaceCheck.checked) {
            findReplaceWrapper.classList.remove('hidden');
            findInput.focus();
        } else {
            findReplaceWrapper.classList.add('hidden');
            findInput.value = '';
            replaceInput.value = '';
            replaceCountEl.textContent = '';
            caseSensitiveCheck.checked = false;
        }
    });


        const applyFindReplace = (text) => {
        if (!findReplaceCheck.checked) return text;
        const findStr = findInput.value;
        const replaceStr = replaceInput.value;
        
        if (!findStr) return text;

        const findList = findStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const replaceList = replaceStr.split(',').map(s => s.trim());

        let result = text;

        for (let i = 0; i < findList.length; i++) {
            const find = findList[i];
            const replace = i < replaceList.length ? replaceList[i] : '';

            if (caseSensitiveCheck.checked) {
                result = result.split(find).join(replace);
            } else {
                const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                result = result.replace(regex, replace);
            }
        }

        return result;
    };



        const updateReplaceCount = () => {
        if (!findReplaceCheck.checked || !findInput.value) {
            replaceCountEl.textContent = '';
            return;
        }
        const findStr = findInput.value;
        const findList = findStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        
        if (findList.length === 0) {
            replaceCountEl.textContent = '';
            return;
        }

        let totalCount = 0;

        allMessages.forEach(m => {
            const text = m.content;
            findList.forEach(find => {
                if (caseSensitiveCheck.checked) {
                    const parts = text.split(find);
                    totalCount += parts.length - 1;
                } else {
                    const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                    const matches = text.match(regex);
                    if (matches) totalCount += matches.length;
                }
            });
        });

        replaceCountEl.textContent = totalCount + ' match' + (totalCount !== 1 ? 'es' : '');
    };



    findInput.addEventListener('input', updateReplaceCount);
    replaceInput.addEventListener('input', updateReplaceCount);
    caseSensitiveCheck.addEventListener('change', updateReplaceCount);



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



        const escapeHtml = (text) => {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        };
        const htmlToMarkdown = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const temp = doc.body;
                  
        const walk = (node) => {
            if (node.nodeType === 3) return node.nodeValue;
            if (node.nodeType !== 1) return '';
            
            const tag = node.tagName;
            if (['SCRIPT','STYLE','SVG'].includes(tag)) return '';
            if (tag === 'BR') return '\n';
            
            const kids = Array.from(node.childNodes).map(walk).join('');
            
            if (tag === 'PRE') return '\n```\n' + node.textContent + '\n```\n';
            if (tag === 'CODE') return '`' + kids + '`';
            if (tag === 'STRONG' || tag === 'B') return '**' + kids + '**';
            if (tag === 'EM' || tag === 'I') return '*' + kids + '*';
            if (tag === 'A') {
                const href = node.getAttribute('href');
                return href ? '[' + kids + '](' + href + ')' : kids;
            }
            if (tag === 'LI') return '- ' + kids + '\n';
            if (tag === 'H1') return '# ' + kids + '\n\n';
            if (tag === 'H2') return '## ' + kids + '\n\n';
            if (tag === 'H3') return '### ' + kids + '\n\n';
            if (tag === 'H4') return '#### ' + kids + '\n\n';
            if (tag === 'H5') return '##### ' + kids + '\n\n';
            if (tag === 'H6') return '###### ' + kids + '\n\n';
            if (tag === 'BLOCKQUOTE') return '> ' + kids + '\n';
            if (tag === 'HR') return '\n---\n';
            if (tag === 'P') return kids + '\n\n';
            if (tag === 'UL' || tag === 'OL') return kids + '\n';
            if (tag === 'DIV' || tag === 'SECTION') return kids + '\n';
            
            return kids;
        };
        
        return walk(temp).replace(/\n{3,}/g, '\n\n').trim();
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
                    let rawHtml = '';
                    let images = [];
                    if (isUser) {
                        const textElement = container.querySelector('.whitespace-pre-line');
                        if (textElement) {
                            content = textElement.textContent.trim();
                            rawHtml = textElement.innerHTML;
                        }
                    } else {
                        const textContainer = container.querySelector('.progressive-markdown-content');
                        if (textContainer) {
                            const clone = textContainer.cloneNode(true);
                            const thinkingPath = clone.querySelector('.thinking-path');
                            if (thinkingPath) thinkingPath.remove();
                            const actionToolbar = clone.querySelector('.action-toolbar');
                            if (actionToolbar) actionToolbar.remove();
                            content = clone.textContent.trim();
                            rawHtml = clone.innerHTML;
                        }
                    }
                    const imgEls = container.querySelectorAll('.inline-image-card img, img[alt="Generated image"]');
                    imgEls.forEach(function(img) {
                        try {
                            var canvas = document.createElement('canvas');
                            canvas.width = img.naturalWidth;
                            canvas.height = img.naturalHeight;
                            if (canvas.width > 0 && canvas.height > 0) {
                                canvas.getContext('2d').drawImage(img, 0, 0);
                                images.push({
                                    src: canvas.toDataURL('image/png'),
                                    alt: img.alt || 'Generated image'
                                });
                            }
                        } catch (e) {}
                    });
                    if (content || images.length > 0) {
                        messages.push({
                            role: isUser ? 'user' : 'assistant',
                            content: content,
                            rawHtml: rawHtml,
                            images: images
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
                messageListEl.textContent = '';
                const noMsgDiv = document.createElement('div');
                noMsgDiv.className = 'loading-list';
                noMsgDiv.style.color = '#ff6b6b';
                noMsgDiv.textContent = 'No messages found. Are you on a chat page?';
                messageListEl.appendChild(noMsgDiv);
            }


            } catch (err) {
            messageListEl.textContent = '';
            const errDiv = document.createElement('div');
            errDiv.className = 'loading-list';
            errDiv.style.color = '#ff6b6b';
            errDiv.textContent = 'Error scanning page: ' + err.message;
            messageListEl.appendChild(errDiv);
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
            
            const rowContentDiv = document.createElement('div');
            rowContentDiv.className = 'list-item-content';

            const roleSpan = document.createElement('div');
            roleSpan.className = `list-item-role ${msg.role}`;
            roleSpan.textContent = msg.role === 'user' ? 'You' : 'Lumo';
            
            const textSpan = document.createElement('div');
            textSpan.className = 'list-item-content-text';
            let displayText = msg.content ? msg.content.substring(0, 60) + (msg.content.length > 60 ? '...' : '') : '';
            if (msg.images && msg.images.length > 0) {
                const imgCount = msg.images.length;
                displayText = displayText ? displayText + ' \uD83D\uDCF7' : '\uD83D\uDCF7 ' + (imgCount > 1 ? imgCount + ' images' : 'image');
            }
            textSpan.textContent = displayText || '(empty)';
            
            rowContentDiv.appendChild(roleSpan);
            rowContentDiv.appendChild(textSpan);
            item.appendChild(checkbox);
            item.appendChild(rowContentDiv);
            
            if (tooltipsEnabled) {
                item.addEventListener('mouseenter', () => {
                    if (!matchesFilter) return;
                    clearTimeout(tooltipTimeout);
                    
                    floatingTooltip.innerHTML = '';
                    
                    const header = document.createElement('div');
                    header.className = 'tooltip-header';
                    header.textContent = msg.role === 'user' ? 'You' : 'Lumo';
                    floatingTooltip.appendChild(header);

                    const tooltipContentDiv = document.createElement('div');
                    tooltipContentDiv.className = 'tooltip-content';
                    
                    if (filterLower) {
                        const escapedFilter = filterLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(`(${escapedFilter})`, 'gi');
                        const parts = msg.content.split(regex);
                        parts.forEach(part => {
                            if (part.toLowerCase() === filterLower) {
                                const span = document.createElement('span');
                                span.className = 'highlight-match';
                                span.textContent = part;
                                tooltipContentDiv.appendChild(span);
                            } else {
                                tooltipContentDiv.appendChild(document.createTextNode(part));
                            }
                        });
                    } else {
                        tooltipContentDiv.textContent = msg.content;
                    }
                    floatingTooltip.appendChild(tooltipContentDiv);

                    if (msg.images && msg.images.length > 0) {
                        const imgContainer = document.createElement('div');
                        imgContainer.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;padding-top:8px;border-top:1px solid #3a3a5a';
                        msg.images.forEach(img => {
                            const imgEl = document.createElement('img');
                            imgEl.src = img.src;
                            imgEl.alt = img.alt;
                            imgEl.style.cssText = 'max-width:100%;border-radius:6px;max-height:300px;object-fit:contain';
                            imgContainer.appendChild(imgEl);
                        });
                        floatingTooltip.appendChild(imgContainer);
                    }

                    header.addEventListener('mousedown', (e) => {
                        isDraggingTooltip = true;
                        currentTooltipHeader = header;
                        dragStartX = e.clientX;
                        dragStartY = e.clientY;
                        dragInitialLeft = floatingTooltip.offsetLeft;
                        dragInitialTop = floatingTooltip.offsetTop;
                        floatingTooltip.style.cursor = 'grabbing';
                        e.preventDefault();
                    });

                    const rect = item.getBoundingClientRect();
                    let top = rect.bottom + 5;
                    let left = rect.left + 30;
                    
                    if (left + 340 > window.innerWidth) left = window.innerWidth - 350;
                    if (left < 5) left = 5;
                    if (top + 400 > window.innerHeight) top = rect.top - 410;
                    if (top < 5) top = 5;
                    
                    floatingTooltip.style.top = `${top}px`;
                    floatingTooltip.style.left = `${left}px`;
                    floatingTooltip.classList.add('visible');
                });
                
                item.addEventListener('mouseleave', () => {
                    clearTimeout(tooltipTimeout);
                    tooltipTimeout = setTimeout(() => {
                        if (!isMouseOverTooltip) {
                            floatingTooltip.classList.remove('visible');
                            if (isDraggingTooltip) {
                                isDraggingTooltip = false;
                                currentTooltipHeader = null;
                                floatingTooltip.style.cursor = 'grab';
                            }
                        }
                    }, 200);
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

    floatingTooltip.addEventListener('mouseenter', () => {
        isMouseOverTooltip = true;
        clearTimeout(tooltipTimeout);
    });

    floatingTooltip.addEventListener('mouseleave', () => {
        isMouseOverTooltip = false;
        clearTimeout(tooltipTimeout);
        floatingTooltip.classList.remove('visible');
    });

    document.addEventListener('click', (e) => {
        if (floatingTooltip.classList.contains('visible')) {
            if (!floatingTooltip.contains(e.target)) {
                floatingTooltip.classList.remove('visible');
            }
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDraggingTooltip || !currentTooltipHeader) return;
        const clientX = e.clientX;
        const clientY = e.clientY;
        const deltaX = clientX - dragStartX;
        const deltaY = clientY - dragStartY;
        floatingTooltip.style.left = `${dragInitialLeft + deltaX}px`;
        floatingTooltip.style.top = `${dragInitialTop + deltaY}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isDraggingTooltip) {
            isDraggingTooltip = false;
            currentTooltipHeader = null;
            floatingTooltip.style.cursor = 'grab';
        }
    });

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
    
    customSelect.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = customSelect.classList.contains('open');
        
  
        document.querySelectorAll('.custom-select').forEach(sel => {
            sel.classList.remove('open');
            sel.querySelector('.custom-options').classList.add('hidden');
        });

        if (!isOpen) {
            customSelect.classList.add('open');
            formatOptions.classList.remove('hidden');
        }
    });

    formatOptionsList.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const value = option.getAttribute('data-value');
            const text = option.textContent;

            
            formatSelect.value = value;

           
            selectedFormatText.textContent = text;

           
            formatOptionsList.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

          
            customSelect.classList.remove('open');
            formatOptions.classList.add('hidden');
        });
    });

    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
            formatOptions.classList.add('hidden');
        }
    });
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
                    const filteredMessages = Array.from(selectedIndices).map(i => {
                    const msg = { ...allMessages[i] };
                    msg.content = applyFindReplace(msg.content);
                    if (msg.rawHtml) msg.rawHtml = applyFindReplace(msg.rawHtml);
                    return msg;
                });
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
                                const filteredMessages = Array.from(selectedIndices).map(i => {
                    const msg = { ...allMessages[i] };
                    msg.content = applyFindReplace(msg.content);
                    if (msg.rawHtml) msg.rawHtml = applyFindReplace(msg.rawHtml);
                    return msg;
                });

                if (format === '2') {
                    content = filteredMessages.map(m => {
                        let txt = `[${m.role.toUpperCase()}]:\n${m.content}\n`;
                        if (m.images && m.images.length > 0) {
                            txt += `[Images: ${m.images.map(img => img.alt).join(', ')}]\n`;
                        }
                        return txt;
                    }).join('\n---\n');
                    mimeType = 'text/plain';
                    extension = 'txt';
                    filename = `lumo-chat-export-${timestamp}.${extension}`;
                } else if (format === '3') {
                    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Lumo Chat Export</title><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6;background:#fafafa}.message{margin-bottom:1.5rem;padding:1rem;border-radius:8px}.user{background:#e3f2fd}.assistant{background:#f5f5f5}.role{font-weight:bold;margin-bottom:0.5rem;color:#555;text-transform:uppercase;font-size:12px}.content{white-space:pre-wrap}.images{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}.images img{max-width:100%;border-radius:8px;max-height:400px;object-fit:contain}</style></head><body><h1>Lumo Chat Export - ${timestamp}</h1>`;
                    filteredMessages.forEach(m => {
                        const safeContent = m.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        html += `<div class="message ${m.role}"><div class="role">${m.role.toUpperCase()}</div><div class="content">${safeContent}</div>`;
                        if (m.images && m.images.length > 0) {
                            html += '<div class="images">';
                            m.images.forEach(img => {
                                const safeAlt = img.alt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                html += `<img src="${img.src}" alt="${safeAlt}" />`;
                            });
                            html += '</div>';
                        }
                        html += `</div>\n`;
                    });
                    html += '</body></html>';
                    content = html;
                    mimeType = 'text/html';
                    extension = 'html';
                    filename = `lumo-chat-export-${timestamp}.${extension}`;
                } else if (format === '4') {
                    let md = `# Lumo Chat Export\n\n`;
                    md += `**Date:** ${timestamp}\n\n`;
                    md += `---\n\n`;
                    
                    filteredMessages.forEach(m => {
                        const roleTitle = m.role === 'user' ? 'You' : 'Lumo';
                        if (m.role === 'assistant' && m.rawHtml) {
                            md += `**${roleTitle}:**\n${htmlToMarkdown(m.rawHtml)}\n\n`;
                        } else {
                            md += `**${roleTitle}:**\n${m.content}\n\n`;
                        }
                        if (m.images && m.images.length > 0) {
                            m.images.forEach(img => {
                                md += `![${img.alt}](${img.src})\n\n`;
                            });
                        }
                    });
                    
                    content = md;
                    mimeType = 'text/markdown';
                    extension = 'md';
                    filename = `lumo-chat-export-${timestamp}.md`;
                    } else if (format === '5') {
                    const jsonString = JSON.stringify({
                        exportedAt: new Date().toISOString(),
                        totalMessages: filteredMessages.length,
                        messages: filteredMessages
                    });
                    const base64Content = btoa(unescape(encodeURIComponent(jsonString)));
                    content = base64Content;
                    mimeType = 'text/plain';
                    extension = 'txt';
                    filename = `lumo-chat-base64-${timestamp}.${extension}`;
                } else {
                    content = JSON.stringify({
                        exportedAt: new Date().toISOString(),
                        totalMessages: filteredMessages.length,
                        messages: filteredMessages
                    }, null, 2);
                    mimeType = 'application/json';
                    extension = 'json';
                    filename = `lumo-chat-export-${timestamp}.${extension}`;
                }




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

  


    const scanCodeBlocks = async () => {
        extractCodeBtn.disabled = true;
        extractCodeBtn.classList.add('loading');
        
        const script = `
            (function() {
                const codes = document.querySelectorAll('code[class^="language-"]');
                const results = [];
                codes.forEach((code, i) => {
                    const className = code.className;
                    const match = className.match(/language-(\\w+)/);
                    const lang = match ? match[1] : 'text';
                    const text = code.textContent.trim();
                    const preview = text.split('\\n').slice(0, 2).join(' | ');
                    results.push({
                        index: i + 1,
                        lang: lang,
                        code: text,
                        preview: preview
                    });
                });
                return results;
            })();
        `;

        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            const result = await browser.tabs.executeScript(tab.id, { code: script });
            
            if (result && result[0]) {
                extractedCodes = result[0];
                renderCodeList();
                codeExtractModal.classList.remove('hidden');
                codeExtractModal.classList.add('active');
            } else {
                setStatus('No code blocks found.', 'error');
            }
        } catch (err) {
            setStatus('Error scanning code: ' + err.message, 'error');
        } finally {
            extractCodeBtn.disabled = false;
            extractCodeBtn.classList.remove('loading');
        }
    };

    const renderCodeList = () => {
        codeListEl.innerHTML = '';
        codeCountEl.textContent = extractedCodes.length;
        
        extractedCodes.forEach((item, idx) => {
            const row = document.createElement('div');
            row.className = 'list-item';
            row.style.borderBottom = '1px solid #2a2a4a';
            row.style.padding = '8px';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.dataset.index = idx;
            
            const content = document.createElement('div');
            content.className = 'list-item-content';
            
            const langBadge = document.createElement('span');
            langBadge.className = 'list-item-role';
            langBadge.textContent = item.lang.toUpperCase();
            langBadge.style.marginRight = '8px';
            
            const preview = document.createElement('div');
            preview.className = 'list-item-content-text';
            preview.textContent = item.preview;
            
            content.appendChild(langBadge);
            content.appendChild(preview);
            
            row.appendChild(checkbox);
            row.appendChild(content);
            
            codeListEl.appendChild(row);
        });
    };

    extractCodeBtn.addEventListener('click', scanCodeBlocks);

    closeCodeModalBtn.addEventListener('click', () => {
        codeExtractModal.classList.remove('active');
        codeExtractModal.classList.add('hidden');
    });

    selectAllCodeBtn.addEventListener('click', () => {
        codeListEl.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
    });

    deselectAllCodeBtn.addEventListener('click', () => {
        codeListEl.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    });

    exportCodeMdBtn.addEventListener('click', () => {
        const selected = extractedCodes.filter((_, i) => codeListEl.querySelectorAll('input[type="checkbox"]')[i].checked);
        if (selected.length === 0) { setStatus('Select at least one code block.', 'error'); return; }
        
        let md = '# Extracted Code Blocks\n\n';
        selected.forEach((item, i) => {
            md += `## Snippet ${i+1}: ${item.lang.toUpperCase()}\n\n`;
            md += '```' + item.lang + '\n';
            md += item.code + '\n';
            md += '```\n\n';
            md += '---\n\n';
        });
        
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lumo-code-extract-${new Date().toISOString().slice(0, 10)}.md`;
        a.click();
        URL.revokeObjectURL(url);
        setStatus(`Exported ${selected.length} code blocks!`, 'success');
        codeExtractModal.classList.remove('active');
        codeExtractModal.classList.add('hidden');
    });

    exportCodeTxtBtn.addEventListener('click', () => {
        const selected = extractedCodes.filter((_, i) => codeListEl.querySelectorAll('input[type="checkbox"]')[i].checked);
        if (selected.length === 0) { setStatus('Select at least one code block.', 'error'); return; }
        
        let txt = '';
        selected.forEach((item, i) => {
            txt += `--- Snippet ${i+1}: ${item.lang.toUpperCase()} ---\n\n`;
            txt += item.code + '\n\n';
        });
        
        const blob = new Blob([txt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lumo-code-extract-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        setStatus(`Exported ${selected.length} code blocks!`, 'success');
        codeExtractModal.classList.remove('active');
        codeExtractModal.classList.add('hidden');
    });



    const loadPermissions = () => {
        browser.permissions.getAll().then(result => {
            const perms = result.permissions || [];
            permListEl.textContent = '';
            
            if (perms.length === 0) {
                permListEl.textContent = 'No permissions found.';
                return;
            }

            perms.forEach((p, index) => {
                let text = '';
                if (p === 'activeTab') text = '✅ activeTab: Access to the current tab only.';
                else if (p === 'downloads') text = '✅ downloads: Save files to your device.';
                else if (p === 'management') text = '✅ management: Scan for conflicting extensions.';
                else text = '⚠️ ' + p;

                const span = document.createElement('span');
                span.textContent = text;
                permListEl.appendChild(span);

                if (index < perms.length - 1) {
                    const br = document.createElement('br');
                    permListEl.appendChild(br);
                }
            });
        }).catch(() => {
            permListEl.textContent = 'Unable to load permissions.';
        });
    };



    const runEnvCheck = async () => {
        envStatusEl.innerHTML = 'Running checks...';
        envStatusEl.style.color = '#ffd700';
        
        const checks = [];
        
        try {
            if (window.crypto && window.crypto.subtle) {
                checks.push('✅ Web Crypto API: Available');
            } else {
                checks.push('❌ Web Crypto API: Missing');
            }
        } catch (e) {
            checks.push('❌ Web Crypto API: Error');
        }

        try {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            if (tabs.length > 0) checks.push('✅ Tabs API: Available');
            else checks.push('❌ Tabs API: Failed');
        } catch (e) {
            checks.push('❌ Tabs API: Error');
        }

        try {
            const manifest = browser.runtime.getManifest();
            checks.push(`✅ Manifest Version: ${manifest.manifest_version}`);
        } catch (e) {
            checks.push('❌ Manifest: Error');
        }
                envStatusEl.textContent = '';

        checks.forEach((check, index) => {
            const span = document.createElement('span');
            span.textContent = check;
            envStatusEl.appendChild(span);

            if (index < checks.length - 1) {
                const br = document.createElement('br');
                envStatusEl.appendChild(br);
            }
        });

        const spacer = document.createElement('br');
        envStatusEl.appendChild(spacer);
        const spacer2 = document.createElement('br');
        envStatusEl.appendChild(spacer2);

        const summary = document.createElement('strong');
        if (checks.every(c => c.startsWith('✅'))) {
            summary.textContent = 'Environment Healthy!';
            summary.style.color = '#51cf66';
            envStatusEl.style.color = '#51cf66';
        } else {
            summary.textContent = 'Issues Detected!';
            summary.style.color = '#ff6b6b';
            envStatusEl.style.color = '#ff6b6b';
        }
        envStatusEl.appendChild(summary);


    };



    const scanExtensions = async () => {
        extListEl.innerHTML = 'Scanning...';
        extListEl.style.color = '#ffd700';
        
        try {
            const extensions = await browser.management.getAll();
            const suspicious = [];
            const safe = [];

            extensions.forEach(ext => {
                const hasAllUrls = ext.permissions && ext.permissions.includes('<all_urls>');
                const name = ext.name.toLowerCase();
                const isSuspicious = hasAllUrls || name.includes('inject') || name.includes('scraper') || name.includes('monitor');
                
                if (isSuspicious) {
                  suspicious.push({ name: ext.name, label: 'Broad permissions' });
                } else {
                    safe.push(`${ext.name}`);
                }
            });

                        extListEl.textContent = '';
            extListEl.style.color = '#e0e0e0';

            if (suspicious.length > 0) {
                const title = document.createElement('strong');
                title.textContent = 'Potential Conflicts:';
                extListEl.appendChild(title);

                const br = document.createElement('br');
                extListEl.appendChild(br);

                suspicious.forEach((item, index) => {
                    const span = document.createElement('span');
                    span.style.color = '#ff6b6b';
                    span.textContent = '⚠️ ' + item.name;
                    extListEl.appendChild(span);

                    const text = document.createElement('span');
                    text.textContent = ' (' + item.label + ')';
                    extListEl.appendChild(text);

                    if (index < suspicious.length - 1) {
                        const brLine = document.createElement('br');
                        extListEl.appendChild(brLine);
                    }
                });

                const br2 = document.createElement('br');
                extListEl.appendChild(br2);
                const br3 = document.createElement('br');
                extListEl.appendChild(br3);
            }

            const safeTitle = document.createElement('strong');
            safeTitle.textContent = 'Safe Extensions (' + safe.length + '):';
            extListEl.appendChild(safeTitle);

            const br4 = document.createElement('br');
            extListEl.appendChild(br4);

            safe.forEach((item, index) => {
                const span = document.createElement('span');
                span.textContent = item;
                extListEl.appendChild(span);

                if (index < safe.length - 1) {
                    const brLine = document.createElement('br');
                    extListEl.appendChild(brLine);
                }
            });
        } catch (e) {
            extListEl.textContent = 'Error scanning extensions: ' + e.message;
            extListEl.style.color = '#ff6b6b';
        }
    };


    const runInjectionTest = async () => {
        injectStatusEl.innerHTML = 'Testing injection...';
        injectStatusEl.style.color = '#ffd700';
        

              try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            const result = await browser.tabs.executeScript(tab.id, { code: '1+1;' });
            
            injectStatusEl.textContent = '';
            
            if (result && result[0] === 2) {
                const successSpan = document.createElement('span');
                successSpan.textContent = '✅ Injection Successful. No blocking detected.';
                successSpan.style.color = '#51cf66';
                injectStatusEl.appendChild(successSpan);
                injectStatusEl.style.color = '#51cf66';
            } else {
                const failSpan = document.createElement('span');
                failSpan.textContent = '❌ Unexpected result from injection.';
                failSpan.style.color = '#ff6b6b';
                injectStatusEl.appendChild(failSpan);
                injectStatusEl.style.color = '#ff6b6b';
            }
        } catch (e) {
            injectStatusEl.textContent = '';
            const errorSpan = document.createElement('span');
            errorSpan.textContent = '❌ Injection Failed: ' + e.message;
            errorSpan.style.color = '#ff6b6b';
            injectStatusEl.appendChild(errorSpan);
            injectStatusEl.style.color = '#ff6b6b';
        }


    };


    runEnvCheckBtn.addEventListener('click', runEnvCheck);
    scanExtBtn.addEventListener('click', scanExtensions);
    runInjectTestBtn.addEventListener('click', runInjectionTest);

        runIntegrityCheckBtn.addEventListener('click', async () => {
        integrityStatusEl.innerHTML = 'Verifying integrity...';
        integrityStatusEl.style.color = '#ffd700';
        
        const result = await verifyIntegrity();
        
               if (result.status === 'valid') {
            integrityStatusEl.textContent = '';
            integrityStatusEl.style.color = '#51cf66';

            const successText = document.createElement('span');
            successText.textContent = '✅ Code Integrity Verified.';
            integrityStatusEl.appendChild(successText);

            const br1 = document.createElement('br');
            integrityStatusEl.appendChild(br1);

            const hashLabel = document.createElement('span');
            hashLabel.style.fontSize = '10px';
            hashLabel.style.wordBreak = 'break-all';
            hashLabel.style.color = '#6c63ff';
            hashLabel.textContent = 'Hash: ' + result.hash;
            integrityStatusEl.appendChild(hashLabel);

        } else if (result.status === 'invalid') {
            integrityStatusEl.textContent = '';
            integrityStatusEl.style.color = '#ff6b6b';

            const failText = document.createElement('span');
            failText.textContent = '❌ Code Tampering Detected!';
            integrityStatusEl.appendChild(failText);

            const br1 = document.createElement('br');
            integrityStatusEl.appendChild(br1);

            const expectedLabel = document.createElement('span');
            expectedLabel.style.fontSize = '10px';
            expectedLabel.style.wordBreak = 'break-all';
            expectedLabel.style.color = '#ff6b6b';
            expectedLabel.textContent = 'Expected: ' + result.expected;
            integrityStatusEl.appendChild(expectedLabel);

            const br2 = document.createElement('br');
            integrityStatusEl.appendChild(br2);

            const actualLabel = document.createElement('span');
            actualLabel.style.fontSize = '10px';
            actualLabel.style.wordBreak = 'break-all';
            actualLabel.style.color = '#ff6b6b';
            actualLabel.textContent = 'Actual: ' + result.actual;
            integrityStatusEl.appendChild(actualLabel);

        } else {
            integrityStatusEl.textContent = '';
            integrityStatusEl.style.color = '#ff6b6b';

            const errorText = document.createElement('span');
            errorText.textContent = '❌ Error: ' + result.message;
            integrityStatusEl.appendChild(errorText);
        }


    });





    const verifyIntegrity = async () => {
        const htmlUrl = browser.runtime.getURL('popup.html');
        const jsUrl = browser.runtime.getURL('popup.js');
        
        try {
            const htmlRes = await fetch(htmlUrl);
            const htmlText = await htmlRes.text();
            
            const hashMatch = htmlText.match(/EXPECTED_HASH:\s*([a-f0-9]{64})/i);
            if (!hashMatch) {
                return { status: 'error', message: 'No hash found in popup.html. Add "EXPECTED_HASH: <hash>" in a comment.' };
            }
            const expectedHash = hashMatch[1].toLowerCase();
            
            const jsRes = await fetch(jsUrl);
            const jsText = await jsRes.text();
            
            const encoder = new TextEncoder();
            const data = encoder.encode(jsText);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            if (calculatedHash === expectedHash) {
                return { status: 'valid', hash: calculatedHash };
            } else {
                return { status: 'invalid', expected: expectedHash, actual: calculatedHash };
            }
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    };




    if (logsBtn && logsModal) {
        logsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            logsModal.classList.remove('hidden');
            logsModal.classList.add('active');
        });

        closeLogsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            logsModal.classList.remove('active');
            logsModal.classList.add('hidden');
        });

        logsModal.addEventListener('click', (e) => {
            if (e.target === logsModal) {
                e.stopPropagation();
                logsModal.classList.remove('active');
                logsModal.classList.add('hidden');
            }
        });

        copyLogScriptBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            try {
                const response = await fetch(browser.runtime.getURL('log-overlay.js'));
                const scriptContent = await response.text();
                
                await navigator.clipboard.writeText(scriptContent);
                
                const status = document.getElementById('copyStatus');
                status.style.display = 'block';
                
                setTimeout(() => {
                    status.style.display = 'none';
                }, 2000);
                
            } catch (err) {
                console.error('Failed to copy:', err);
                alert('Failed to load script. Please check console.');
            }
        });
    }



    // Image Extraction Feature
    const extractImageBtn = document.getElementById('extractImageBtn');
    const imageExtractModal = document.getElementById('imageExtractModal');
    const closeImageModalBtn = document.getElementById('closeImageModalBtn');
    const imageListEl = document.getElementById('imageList');
    const imageCountEl = document.getElementById('imageCount');
    const selectAllImageBtn = document.getElementById('selectAllImageBtn');
    const deselectAllImageBtn = document.getElementById('deselectAllImageBtn');
    const exportImageHtmlBtn = document.getElementById('exportImageHtmlBtn');
    const exportImageZipBtn = document.getElementById('exportImageZipBtn');
    let extractedImages = [];

    const dataUrlToBlob = (dataUrl) => {
        const parts = dataUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)[1];
        const bytes = atob(parts[1]);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        return new Blob([arr], { type: mime });
    };

    const getImageExtension = (dataUrl) => {
        const match = dataUrl.match(/^data:image\/(\w+);/);
        return match ? match[1] : 'png';
    };

    const scanImages = async () => {
        extractImageBtn.disabled = true;
        extractImageBtn.classList.add('loading');
        const script = `
            (function() {
                const images = [];
                const imgEls = document.querySelectorAll('.inline-image-card img, img[alt="Generated image"]');
                imgEls.forEach(function(img) {
                    try {
                        var canvas = document.createElement('canvas');
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        if (canvas.width > 0 && canvas.height > 0) {
                            canvas.getContext('2d').drawImage(img, 0, 0);
                            images.push({
                                src: canvas.toDataURL('image/png'),
                                alt: img.alt || 'Generated image'
                            });
                        }
                    } catch (e) {}
                });
                return images;
            })();
        `;
        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            const result = await browser.tabs.executeScript(tab.id, { code: script });
            if (result && result[0]) {
                extractedImages = result[0];
                renderImageList();
                imageExtractModal.classList.remove('hidden');
                imageExtractModal.classList.add('active');
            } else {
                setStatus('No images found.', 'error');
            }
        } catch (err) {
            setStatus('Error scanning images: ' + err.message, 'error');
        } finally {
            extractImageBtn.disabled = false;
            extractImageBtn.classList.remove('loading');
        }
    };

    const renderImageList = () => {
        while (imageListEl.firstChild) {
            imageListEl.removeChild(imageListEl.firstChild);
        }
        imageCountEl.textContent = extractedImages.length;
        if (extractedImages.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = 'No images found.';
            emptyMsg.style.cssText = 'color: #a0a0b0; padding: 20px; text-align: center; width: 100%;';
            imageListEl.appendChild(emptyMsg);
            return;
        }
        extractedImages.forEach((item, idx) => {
            const card = document.createElement('div');
            card.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px;border:1px solid #2a2a4a;border-radius:8px;background:#1a1a3e;cursor:pointer;transition:border-color 0.2s;width:calc(50% - 10px);min-width:150px;position:relative;';
            card.dataset.index = idx;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.dataset.index = idx;
            checkbox.style.cssText = 'position:absolute;top:8px;left:8px;z-index:2;width:18px;height:18px;accent-color:#f06595;cursor:pointer;';
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.alt;
            img.style.cssText = 'width:100%;max-height:180px;object-fit:contain;border-radius:4px;background:#0d0d2b;';
            const label = document.createElement('div');
            label.style.cssText = 'font-size:11px;color:#a0a0b0;text-align:center;word-break:break-all;';
            label.textContent = item.alt;
            card.appendChild(checkbox);
            card.appendChild(img);
            card.appendChild(label);
            card.addEventListener('click', (e) => {
                if (e.target === checkbox) return;
                checkbox.checked = !checkbox.checked;
            });
            checkbox.addEventListener('change', (e) => e.stopPropagation());
            imageListEl.appendChild(card);
        });
    };

    const getSelectedImages = () => {
        return extractedImages.filter((_, i) => {
            const cb = imageListEl.querySelectorAll('input[type="checkbox"]')[i];
            return cb && cb.checked;
        });
    };

    extractImageBtn.addEventListener('click', scanImages);

    closeImageModalBtn.addEventListener('click', () => {
        imageExtractModal.classList.remove('active');
        imageExtractModal.classList.add('hidden');
    });

    imageExtractModal.addEventListener('click', (e) => {
        if (e.target === imageExtractModal) {
            imageExtractModal.classList.remove('active');
            imageExtractModal.classList.add('hidden');
        }
    });

    selectAllImageBtn.addEventListener('click', () => {
        imageListEl.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
    });

    deselectAllImageBtn.addEventListener('click', () => {
        imageListEl.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    });

    exportImageHtmlBtn.addEventListener('click', () => {
        const selected = getSelectedImages();
        if (selected.length === 0) { setStatus('Select at least one image.', 'error'); return; }
        let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Extracted Images</title><style>body{font-family:sans-serif;max-width:1000px;margin:2rem auto;padding:0 1rem;background:#1a1a2e;color:#e0e0e0}.gallery{display:flex;flex-wrap:wrap;gap:20px;justify-content:center}.card{background:#16213e;border-radius:12px;padding:12px;border:1px solid #2a2a4a;max-width:400px}.card img{width:100%;border-radius:8px;display:block}.card .label{font-size:12px;color:#a0a0b0;margin-top:8px;text-align:center}h1{text-align:center;color:#f06595}</style></head><body><h1>Extracted Images</h1><div class="gallery">';
        selected.forEach(img => {
            const safeAlt = img.alt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            html += '<div class="card"><img src="' + img.src + '" alt="' + safeAlt + '" /><div class="label">' + safeAlt + '</div></div>';
        });
        html += '</div></body></html>';
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lumo-images-' + new Date().toISOString().slice(0, 10) + '.html';
        a.click();
        URL.revokeObjectURL(url);
        setStatus('Exported ' + selected.length + ' images!', 'success');
        imageExtractModal.classList.remove('active');
        imageExtractModal.classList.add('hidden');
    });

    exportImageZipBtn.addEventListener('click', () => {
        const selected = getSelectedImages();
        if (selected.length === 0) { setStatus('Select at least one image.', 'error'); return; }
        let done = 0;
        selected.forEach((img, i) => {
            setTimeout(() => {
                const ext = getImageExtension(img.src);
                const blob = dataUrlToBlob(img.src);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'lumo-image-' + (i + 1) + '.' + ext;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                done++;
                if (done === selected.length) {
                    setStatus('Downloaded ' + selected.length + ' images!', 'success');
                    imageExtractModal.classList.remove('active');
                    imageExtractModal.classList.add('hidden');
                }
            }, i * 300);
        });
    });

  scanPage();

});
