document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('exportBtn');
    const formatSelect = document.getElementById('format');
    const statusDiv = document.getElementById('status');

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

    const downloadFile = (content, filename, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    exportBtn.addEventListener('click', async () => {
        const format = formatSelect.value;
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
                let content, mimeType, extension;

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

                const filename = `lumo-chat-export-${timestamp}.${extension}`;
                downloadFile(content, filename, mimeType);
                setStatus(`Exported ${data.count} messages successfully!`, 'success');
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
