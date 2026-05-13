(function() {
    if (window.__lumoModernLogsActive) return;
    window.__lumoModernLogsActive = true;

    var box = document.createElement('div');
    box.id = '__lumoModernLogs';
    box.style.cssText = 'position:fixed;top:20px;right:20px;width:450px;height:550px;background:#1e1e2e;color:#0f0;font-size:11px;z-index:999999;border:1px solid #444;font-family:monospace;box-shadow:0 10px 30px rgba(0,0,0,0.5);display:flex;flex-direction:column;overflow:hidden;border-radius:8px;';

    var header = document.createElement('div');
    header.style.cssText = 'background:#2d2d44;color:#fff;padding:10px 12px;font-weight:bold;cursor:move;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #444;border-radius:8px 8px 0 0;user-select:none;';
    header.innerHTML = '<span>\uD83D\uDCDC Live Connection Logs</span><button id="__lumoCloseLogs" style="background:none;border:none;color:#ff6b6b;font-size:18px;cursor:pointer;line-height:1;padding:0 4px;">\u2715</button>';

    var content = document.createElement('div');
    content.id = '__lumoLogsContent';
    content.style.cssText = 'flex:1;overflow-y:auto;padding:10px;white-space:pre-wrap;word-break:break-all;background:#121218;';
    content.textContent = '\uD83D\uDFE2 LOG CAPTURE ACTIVE\nWaiting for logs...';

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

    var log = function(msg) {
        var line = document.createElement('div');
        line.textContent = msg;
        line.style.marginBottom = '3px';
        line.style.borderBottom = '1px solid #222';
        line.style.paddingBottom = '2px';
        content.appendChild(line);
        content.scrollTop = content.scrollHeight;
    };

    log('\uD83D\uDFE2 LOG CAPTURE ACTIVE');
    log('Capturing ALL console output...');

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
        log(str);
        originalWarn.apply(console, arguments);
    };

    var originalError = console.error.bind(console);
    console.error = function() {
        var str = Array.prototype.slice.call(arguments).map(function(a) {
            if (typeof a === 'object') { try { return JSON.stringify(a); } catch(e) { return '[Object]'; } }
            return String(a);
        }).join(' ');
        log(str);
        originalError.apply(console, arguments);
    };
})();
