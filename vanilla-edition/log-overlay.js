(function() {
    if (window.__lumoModernLogsActive) return;
    window.__lumoModernLogsActive = true;

    var box = document.createElement('div');
    box.id = '__lumoModernLogs';
    box.style.cssText = 'position:fixed;top:20px;right:20px;width:450px;height:550px;background:#1e1e2e;color:#0f0;font-size:11px;z-index:999999;border:1px solid #444;font-family:monospace;box-shadow:0 10px 30px rgba(0,0,0,0.5);display:flex;flex-direction:column;overflow:hidden;border-radius:8px;';

    var header = document.createElement('div');
    header.style.cssText = 'background:#2d2d44;color:#fff;padding:10px 12px;cursor:move;display:flex;flex-direction:column;gap:8px;border-bottom:1px solid #444;border-radius:8px 8px 0 0;user-select:none;';

    var headerRow = document.createElement('div');
    headerRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';
    headerRow.innerHTML = '<span>\uD83D\uDCDC Live Connection Logs</span><button id="__lumoCloseLogs" style="background:none;border:none;color:#ff6b6b;font-size:18px;cursor:pointer;line-height:1;padding:0 4px;">\u2715</button>';

    var filterRow = document.createElement('div');
    filterRow.style.cssText = 'display:flex;align-items:center;gap:8px;position:relative;';

    var filterLabel = document.createElement('span');
    filterLabel.textContent = 'Filter:';
    filterLabel.style.cssText = 'font-size:10px;color:#a0a0b0;';

    var customSelect = document.createElement('div');
    customSelect.id = '__lumoCustomSelect';
    customSelect.style.cssText = 'flex:1;background:#16213e;border:1px solid #3a3a5a;border-radius:4px;cursor:pointer;position:relative;';
    
    var selectedText = document.createElement('div');
    selectedText.id = '__lumoSelectedText';
    selectedText.textContent = 'All Logs';
    selectedText.style.cssText = 'padding:4px 8px;color:#e0e0e0;font-size:10px;display:flex;justify-content:space-between;align-items:center;';
    selectedText.innerHTML += '<span style="color:#6c63ff;font-size:8px;">&#9662;</span>';

    var optionsList = document.createElement('div');
    optionsList.id = '__lumoOptionsList';
    optionsList.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:#16213e;border:1px solid #3a3a5a;border-top:none;border-radius:0 0 4px 4px;max-height:150px;overflow-y:auto;z-index:100;display:none;';
    
    var options = [
        { value: 'all', text: 'All Logs' },
        { value: 'message_meta', text: 'Message Metadata' },
        { value: 'remote_id', text: 'Remote ID Mappings' },
        { value: 'conversation', text: 'Conversation Updates' },
        { value: 'api', text: 'API Calls' },
        { value: 'errors', text: 'Errors Only' }
    ];

    var currentFilter = 'all';

    options.forEach(function(opt) {
        var optDiv = document.createElement('div');
        optDiv.textContent = opt.text;
        optDiv.style.cssText = 'padding:4px 8px;color:#e0e0e0;font-size:10px;cursor:pointer;transition:background 0.2s;';
        optDiv.dataset.value = opt.value;
        optDiv.addEventListener('mouseenter', function() { this.style.background = '#2a2a4a'; });
        optDiv.addEventListener('mouseleave', function() { this.style.background = ''; });
        optDiv.addEventListener('click', function() {
            currentFilter = opt.value;
            selectedText.innerHTML = opt.text + '<span style="color:#6c63ff;font-size:8px;">&#9662;</span>';
            optionsList.style.display = 'none';
            applyFilter();
        });
        optionsList.appendChild(optDiv);
    });

    customSelect.appendChild(selectedText);
    customSelect.appendChild(optionsList);

    customSelect.addEventListener('click', function(e) {
        e.stopPropagation();
        var isVisible = optionsList.style.display === 'block';
        optionsList.style.display = isVisible ? 'none' : 'block';
    });

    document.addEventListener('click', function() {
        optionsList.style.display = 'none';
    });

    var countBadge = document.createElement('span');
    countBadge.id = '__lumoLogCount';
    countBadge.style.cssText = 'font-size:10px;color:#6c63ff;font-weight:bold;min-width:40px;text-align:right;';

    filterRow.appendChild(filterLabel);
    filterRow.appendChild(customSelect);
    filterRow.appendChild(countBadge);

    header.appendChild(headerRow);
    header.appendChild(filterRow);

    var content = document.createElement('div');
    content.id = '__lumoLogsContent';
    content.style.cssText = 'flex:1;overflow-y:auto;padding:10px;white-space:pre-wrap;word-break:break-all;background:#121218;';
    content.textContent = '';

    box.appendChild(header);
    box.appendChild(content);

    var directions = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    var styles = {
        'n': 'top:-5px;left:0;right:0;height:10px;cursor:ns-resize;',
        's': 'bottom:-5px;left:0;right:0;height:10px;cursor:ns-resize;',
        'e': 'top:0;bottom:0;right:-5px;width:10px;cursor:ew-resize;',
        'w': 'top:0;bottom:0;left:-5px;width:10px;cursor:ew-resize;',
        'ne': 'top:-5px;right:-5px;width:15px;height:15px;cursor:nesw-resize;',
        'nw': 'top:-5px;left:-5px;width:15px;height:15px;cursor:nwse-resize;',
        'se': 'bottom:-5px;right:-5px;width:15px;height:15px;cursor:nwse-resize;',
        'sw': 'bottom:-5px;left:-5px;width:15px;height:15px;cursor:nesw-resize;'
    };

    directions.forEach(function(dir) {
        var handle = document.createElement('div');
        handle.className = '__lumoResizerHandle';
        handle.setAttribute('data-dir', dir);
        handle.style.cssText = 'position:absolute;' + styles[dir] + 'background:rgba(108, 99, 255, 0.6);border-radius:2px;z-index:20;opacity:0.5;transition:opacity 0.2s;';
        handle.title = "Drag to resize " + dir.toUpperCase();
        handle.addEventListener('mouseenter', function() { this.style.opacity = '1'; });
        handle.addEventListener('mouseleave', function() { this.style.opacity = '0.5'; });
        box.appendChild(handle);
    });

    document.body.appendChild(box);

    var isDragging = false;
    var startX, startY, initialLeft, initialTop;

    header.addEventListener('mousedown', function(e) {
        if (e.target.closest('#__lumoCustomSelect')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = box.offsetLeft;
        initialTop = box.offsetTop;
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        box.style.left = (initialLeft + e.clientX - startX) + 'px';
        box.style.top = (initialTop + e.clientY - startY) + 'px';
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
    });

    var isResizing = false;
    var currentDir = null;
    var rStartX, rStartY, startWidth, startHeight, startLeft, startTop;

    document.querySelectorAll('.__lumoResizerHandle').forEach(function(handle) {
        handle.addEventListener('mousedown', function(e) {
            isResizing = true;
            currentDir = handle.getAttribute('data-dir');
            rStartX = e.clientX;
            rStartY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(box).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(box).height, 10);
            startLeft = box.offsetLeft;
            startTop = box.offsetTop;
            e.preventDefault();
            e.stopPropagation();
        });
    });

    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        var dx = e.clientX - rStartX;
        var dy = e.clientY - rStartY;
        if (currentDir.indexOf('e') !== -1) {
            box.style.width = (startWidth + dx) + 'px';
        }
        if (currentDir.indexOf('w') !== -1) {
            box.style.width = (startWidth - dx) + 'px';
            box.style.left = (startLeft + dx) + 'px';
        }
        if (currentDir.indexOf('s') !== -1) {
            box.style.height = (startHeight + dy) + 'px';
        }
        if (currentDir.indexOf('n') !== -1) {
            box.style.height = (startHeight - dy) + 'px';
            box.style.top = (startTop + dy) + 'px';
        }
    });

    document.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            currentDir = null;
        }
    });

    document.getElementById('__lumoCloseLogs').addEventListener('click', function() {
        box.remove();
        window.__lumoModernLogsActive = false;
    });

    var categorize = function(str) {
        var s = str.toLowerCase();
        if (s.indexOf('message') !== -1 && (s.indexOf('updated') !== -1 || s.indexOf('updating') !== -1 || s.indexOf('saving') !== -1 || s.indexOf('dirty') !== -1)) return 'message_meta';
        if (s.indexOf('push message') !== -1 || s.indexOf('remote id') !== -1 || s.indexOf('mapping') !== -1 || s.indexOf('addremoteid') !== -1 || s.indexOf('addidmap') !== -1 || s.indexOf('waitformapping') !== -1) return 'remote_id';
        if (s.indexOf('conversation') !== -1 && (s.indexOf('updated') !== -1 || s.indexOf('updating') !== -1 || s.indexOf('saving') !== -1 || s.indexOf('dirty') !== -1)) return 'conversation';
        if (s.indexOf('lumo api') !== -1 || s.indexOf('httppost') !== -1 || s.indexOf('httpput') !== -1 || s.indexOf('http post') !== -1 || s.indexOf('http put') !== -1) return 'api';
        if (s.indexOf('error') !== -1 || s.indexOf('fail') !== -1 || s.indexOf('exception') !== -1) return 'errors';
        return 'other';
    };

    var updateCount = function() {
        var visible = content.querySelectorAll('div[data-cat]').length;
        var shown = 0;
        if (currentFilter === 'all') {
            shown = content.querySelectorAll('div[data-cat]:not([data-cat="system"])').length;
        } else {
            shown = content.querySelectorAll('div[data-cat="' + currentFilter + '"]').length;
        }
        countBadge.textContent = shown + '/' + visible;
    };

    var applyFilter = function() {
        var lines = content.querySelectorAll('div[data-cat]');
        lines.forEach(function(line) {
            var cat = line.getAttribute('data-cat');
            if (currentFilter === 'all' || cat === currentFilter) {
                line.style.display = '';
            } else {
                line.style.display = 'none';
            }
        });
        updateCount();
    };

    var log = function(msg, cat) {
        var line = document.createElement('div');
        line.textContent = msg;
        line.style.marginBottom = '3px';
        line.style.borderBottom = '1px solid #222';
        line.style.paddingBottom = '2px';
        var category = cat || categorize(msg);
        line.setAttribute('data-cat', category);
        if (category === 'errors') line.style.color = '#ff6b6b';
        else if (category === 'api') line.style.color = '#ffd43b';
        else if (category === 'remote_id') line.style.color = '#51cf66';
        else if (category === 'message_meta') line.style.color = '#74c0fc';
        else if (category === 'conversation') line.style.color = '#da77f2';
        if (currentFilter !== 'all' && category !== currentFilter) {
            line.style.display = 'none';
        }
        content.appendChild(line);
        content.scrollTop = content.scrollHeight;
        updateCount();
    };

    log('\uD83D\uDFE2 LOG CAPTURE ACTIVE', 'system');
    log('Capturing ALL console output...', 'system');



    var originalLog = console.log.bind(console);
    console.log = function() {
        var str = Array.prototype.slice.call(arguments).map(function(a) {
            if (typeof a === 'object') { try { return JSON.stringify(a); } catch(e) { return '[Object]'; } }
            return String(a);
        }).join(' ');
        log(str);
        originalLog.apply(console, arguments);
    };

    var originalInfo = console.info.bind(console);
    console.info = function() {
        var str = Array.prototype.slice.call(arguments).map(function(a) {
            if (typeof a === 'object') { try { return JSON.stringify(a); } catch(e) { return '[Object]'; } }
            return String(a);
        }).join(' ');
        log(str);
        originalInfo.apply(console, arguments);
    };

    var originalWarn = console.warn.bind(console);
    console.warn = function() {
        var str = Array.prototype.slice.call(arguments).map(function(a) {
            if (typeof a === 'object') { try { return JSON.stringify(a); } catch(e) { return '[Object]'; } }
            return String(a);
        }).join(' ');
        log(str, 'errors');
        originalWarn.apply(console, arguments);
    };

    var originalError = console.error.bind(console);
    console.error = function() {
        var str = Array.prototype.slice.call(arguments).map(function(a) {
            if (typeof a === 'object') { try { return JSON.stringify(a); } catch(e) { return '[Object]'; } }
            return String(a);
        }).join(' ');
        log(str, 'errors');
        originalError.apply(console, arguments);
    };
})();
