/**
 * 玉子市场 - SillyTavern 悬浮窗扩展
 * Tamako Market Float Window Extension
 * @author yuzi83
 * @version 2.1.2
 * @link https://github.com/yuzi83/st-tamako-market
 */

const extensionName = 'TamakoMarket';

const defaultSettings = {
    enabled: true,
    windowX: null,
    windowY: null,
    windowWidth: 380,
    windowHeight: 450,
    autoCapture: true,
    captureTags: ['recall', 'scene_direction'],
    theme: 'tamako',
    maxScanMessages: 50,
    maxStoredPlots: 50,
    toggleX: null,
    toggleY: null,
};

const themes = {
    tamako: { name: '🌸 玉子市场', primary: '#FFB6C1', secondary: '#DDA0DD' },
    ocean: { name: '🌊 海边小店', primary: '#87CEEB', secondary: '#5F9EA0' },
    sunflower: { name: '🌻 向日葵田', primary: '#FFD700', secondary: '#FFA500' },
    night: { name: '🌙 夜间模式', primary: '#9370DB', secondary: '#6A5ACD', dark: true },
};

const deraMessages = {
    empty: ['德拉在打瞌睡...💤', '店里空空的，德拉好无聊~', '德拉等着新货到来！🐔'],
    newItem: ['德拉发现了新货！🐔✨', '有新商品入库啦！', '德拉：这个看起来不错哦~'],
    scanning: ['德拉正在努力搜寻...🔍', '等等，德拉在找东西~', '德拉的雷达启动中...📡'],
    found: ['德拉找到了好多东西！✨', '搜寻完毕！德拉很棒吧~🐔', '库存已更新，德拉辛苦了！'],
    delete: ['德拉帮你打包好了~📦', '清理完毕！店铺更整洁了~', '德拉：这些就交给我处理吧！'],
    noResult: ['德拉找不到这个呢...🐔💦', '没有匹配的商品哦~', '德拉翻遍了也没找到~'],
    tooMany: ['商品太多了，德拉只拿了一部分~📦', '库存爆满！德拉尽力了~🐔💦'],
};

let capturedPlots = [];
let deleteMode = false;
let extensionEnabled = true;
let searchQuery = '';
let currentTheme = 'tamako';

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || window.innerWidth <= 768 
        || ('ontouchstart' in window);
}

function getDeraMessage(type) {
    const messages = deraMessages[type] || deraMessages.empty;
    return messages[Math.floor(Math.random() * messages.length)];
}

function getDefaultWindowPosition() {
    const isMobile = isMobileDevice();
    const width = isMobile ? Math.min(340, window.innerWidth - 20) : defaultSettings.windowWidth;
    const height = isMobile ? Math.min(400, window.innerHeight - 100) : defaultSettings.windowHeight;
    
    return {
        x: Math.max(10, Math.floor((window.innerWidth - width) / 2)),
        y: Math.max(60, Math.floor((window.innerHeight - height) / 2) - 50),
        width: width,
        height: height
    };
}

function getDefaultTogglePosition() {
    const isMobile = isMobileDevice();
    if (isMobile) {
        return { 
            x: Math.max(10, window.innerWidth - 130), 
            y: Math.max(10, window.innerHeight - 160) 
        };
    }
    return { 
        x: Math.max(10, window.innerWidth - 330), 
        y: 10 
    };
}

function getSettings() {
    try {
        const context = SillyTavern.getContext();
        if (context?.extensionSettings) {
            if (!context.extensionSettings[extensionName]) {
                context.extensionSettings[extensionName] = { ...defaultSettings };
            }
            const s = context.extensionSettings[extensionName];
            if (!s.captureTags) s.captureTags = [...defaultSettings.captureTags];
            if (!s.maxScanMessages) s.maxScanMessages = defaultSettings.maxScanMessages;
            if (!s.maxStoredPlots) s.maxStoredPlots = defaultSettings.maxStoredPlots;
            return s;
        }
    } catch (e) {
        console.warn('[玉子市场] 无法获取设置:', e);
    }
    return { ...defaultSettings };
}

function saveSetting(key, value) {
    try {
        const settings = getSettings();
        settings[key] = value;
        SillyTavern.getContext()?.saveSettingsDebounced?.();
    } catch (e) {
        console.warn('[玉子市场] 保存失败:', e);
    }
}

function applyTheme(themeName) {
    const theme = themes[themeName] || themes.tamako;
    currentTheme = themeName;
    
    const $window = $('#tamako-market-window');
    const $toggle = $('#tamako-market-toggle');
    
    $window.removeClass('theme-tamako theme-ocean theme-sunflower theme-night').addClass(`theme-${themeName}`);
    $toggle.removeClass('theme-tamako theme-ocean theme-sunflower theme-night').addClass(`theme-${themeName}`);
    
    $window.css({ '--theme-primary': theme.primary, '--theme-secondary': theme.secondary });
    $toggle.css({ '--theme-primary': theme.primary, '--theme-secondary': theme.secondary });
    
    saveSetting('theme', themeName);
    $('#tamako-theme-selector').val(themeName);
}

function resetWindowPosition() {
    const $window = $('#tamako-market-window');
    const pos = getDefaultWindowPosition();
    
    saveSetting('windowX', null);
    saveSetting('windowY', null);
    saveSetting('windowWidth', pos.width);
    saveSetting('windowHeight', pos.height);
    
    $window.css({
        left: pos.x + 'px',
        top: pos.y + 'px',
        width: pos.width + 'px',
        height: pos.height + 'px'
    });
    
    $window.removeClass('minimized');
    $window.find('.tamako-btn.minimize i').removeClass('fa-expand').addClass('fa-minus');
    
    toggleWindow(true);
}

function resetTogglePosition() {
    const $toggle = $('#tamako-market-toggle');
    const pos = getDefaultTogglePosition();
    
    saveSetting('toggleX', null);
    saveSetting('toggleY', null);
    
    $toggle.css({
        left: pos.x + 'px',
        top: pos.y + 'px',
        right: 'auto',
        bottom: 'auto'
    });
}

function extractAMCodes(content) {
    const regex = /AM\d{4}/gi;
    const matches = content.match(regex);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.toUpperCase()))];
}

function formatAMCodes(codes) {
    if (codes.length === 0) return '暂时没有商品入库哦~';
    if (codes.length <= 3) return codes.join(', ');
    return `${codes.slice(0, 3).join(', ')} 等${codes.length}件`;
}

function showDeraToast(type) {
    const message = getDeraMessage(type);
    const $toast = $('#tamako-dera-toast');
    $toast.text(message).addClass('show');
    setTimeout(() => $toast.removeClass('show'), 2000);
}

function highlightText(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function getEventPosition(e) {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (e.changedTouches && e.changedTouches.length > 0) {
        return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

function constrainPosition(x, y, width, height) {
    const maxX = Math.max(0, window.innerWidth - width);
    const maxY = Math.max(0, window.innerHeight - height);
    return {
        x: Math.max(0, Math.min(x, maxX)),
        y: Math.max(0, Math.min(y, maxY))
    };
}

function createWindow() {
    if (document.getElementById('tamako-market-window')) {
        return $('#tamako-market-window');
    }

    let themeOptions = '';
    for (const [key, theme] of Object.entries(themes)) {
        themeOptions += `<option value="${key}">${theme.name}</option>`;
    }

    const isMobile = isMobileDevice();
    const mobileClass = isMobile ? 'tamako-mobile' : '';

    const windowHtml = `
        <div id="tamako-market-window" class="tamako-window theme-tamako ${mobileClass}">
            <div class="tamako-header">
                <div class="tamako-drag-handle">
                    <div class="tamako-title">
                        <span>🏪</span>
                        <span>玉子市场</span>
                    </div>
                </div>
                <div class="tamako-controls">
                    <button class="tamako-btn minimize" title="收起摊位"><i class="fa-solid fa-minus"></i></button>
                    <button class="tamako-btn scan" title="扫描消息"><i class="fa-solid fa-magnifying-glass"></i></button>
                    <button class="tamako-btn delete-mode" title="整理商品"><i class="fa-solid fa-broom"></i></button>
                    <button class="tamako-btn theme-toggle" title="切换主题"><i class="fa-solid fa-palette"></i></button>
                    <button class="tamako-btn close" title="打烊"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
            <div class="tamako-theme-panel" style="display: none;">
                <select id="tamako-theme-selector">${themeOptions}</select>
            </div>
            <div class="tamako-tabs">
                <button class="tamako-tab active" data-tab="current">🍡 今日特选</button>
                <button class="tamako-tab" data-tab="history">📦 库存 (<span id="tamako-history-count">0</span>)</button>
            </div>
            <div id="tamako-dera-toast" class="tamako-toast"></div>
            <div class="tamako-content" data-content="current">
                <div class="tamako-empty">
                    <span class="icon">🐔</span>
                    <span class="message">${getDeraMessage('empty')}</span>
                </div>
            </div>
            <div class="tamako-content" data-content="history" style="display: none;">
                <div class="tamako-search">
                    <i class="fa-solid fa-search"></i>
                    <input type="text" id="tamako-search-input" placeholder="搜索商品 (AM编号/关键词)...">
                    <button class="tamako-search-clear" title="清除" style="display: none;"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="tamako-history-list"></div>
            </div>
            <div class="tamako-delete-bar" style="display: none;">
                <label class="tamako-select-all">
                    <input type="checkbox" id="tamako-select-all">
                    <span>全部打包</span>
                </label>
                <div class="tamako-delete-actions">
                    <button class="tamako-delete-confirm">🗑️ 清理选中</button>
                    <button class="tamako-delete-cancel">取消</button>
                </div>
            </div>
            <div class="tamako-resize tamako-resize-e"></div>
            <div class="tamako-resize tamako-resize-s"></div>
            <div class="tamako-resize tamako-resize-se"></div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', windowHtml);
    
    const $window = $('#tamako-market-window');
    const settings = getSettings();
    const defaultPos = getDefaultWindowPosition();
    
    const posX = (settings.windowX !== null && settings.windowX !== undefined) ? settings.windowX : defaultPos.x;
    const posY = (settings.windowY !== null && settings.windowY !== undefined) ? settings.windowY : defaultPos.y;
    const width = settings.windowWidth || defaultPos.width;
    const height = settings.windowHeight || defaultPos.height;
    
    $window.css({
        left: posX + 'px',
        top: posY + 'px',
        width: width + 'px',
        height: height + 'px',
    });
    
    initDraggable($window);
    initResizable($window);
    bindWindowEvents($window);
    applyTheme(settings.theme || 'tamako');
    
    window.addEventListener('resize', () => {
        const $win = $('#tamako-market-window');
        if ($win.hasClass('visible')) {
            const rect = $win[0].getBoundingClientRect();
            const constrained = constrainPosition(rect.left, rect.top, rect.width, rect.height);
            $win.css({ left: constrained.x + 'px', top: constrained.y + 'px' });
        }
        
        const $toggle = $('#tamako-market-toggle');
        if ($toggle.length) {
            const toggleRect = $toggle[0].getBoundingClientRect();
            const toggleConstrained = constrainPosition(toggleRect.left, toggleRect.top, toggleRect.width, toggleRect.height);
            $toggle.css({ left: toggleConstrained.x + 'px', top: toggleConstrained.y + 'px' });
        }
    });
    
    return $window;
}

function initDraggable($window) {
    const header = $window.find('.tamako-header')[0];
    let isDragging = false;
    let offsetX, offsetY;
    
    function startDrag(e) {
        if (e.target.closest('.tamako-btn') || e.target.closest('.tamako-controls')) return;
        
        isDragging = true;
        const pos = getEventPosition(e);
        const rect = $window[0].getBoundingClientRect();
        offsetX = pos.x - rect.left;
        offsetY = pos.y - rect.top;
        
        $window.addClass('dragging');
        e.preventDefault();
    }
    
    function moveDrag(e) {
        if (!isDragging) return;
        
        const pos = getEventPosition(e);
        const width = $window[0].offsetWidth;
        const height = $window[0].offsetHeight;
        
        let newX = pos.x - offsetX;
        let newY = pos.y - offsetY;
        
        const constrained = constrainPosition(newX, newY, width, height);
        
        $window.css({ 
            left: constrained.x + 'px', 
            top: constrained.y + 'px' 
        });
        
        e.preventDefault();
    }
    
    function endDrag() {
        if (isDragging) {
            isDragging = false;
            $window.removeClass('dragging');
            
            const currentX = parseInt($window.css('left'));
            const currentY = parseInt($window.css('top'));
            saveSetting('windowX', currentX);
            saveSetting('windowY', currentY);
        }
    }
    
    header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);
    
    header.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);
}

function initResizable($window) {
    let isResizing = false;
    let currentHandle = '';
    let startX, startY, startWidth, startHeight;
    
    function startResize(e) {
        isResizing = true;
        const classList = this.className;
        currentHandle = classList.includes('resize-se') ? 'se' : 
                       classList.includes('resize-s') ? 's' : 
                       classList.includes('resize-e') ? 'e' : '';
        
        const pos = getEventPosition(e);
        startX = pos.x;
        startY = pos.y;
        startWidth = $window[0].offsetWidth;
        startHeight = $window[0].offsetHeight;
        
        $window.addClass('resizing');
        
        e.preventDefault();
        e.stopPropagation();
    }
    
    function moveResize(e) {
        if (!isResizing) return;
        
        const pos = getEventPosition(e);
        const deltaX = pos.x - startX;
        const deltaY = pos.y - startY;
        
        const isMobile = isMobileDevice();
        const minWidth = isMobile ? 260 : 280;
        const minHeight = isMobile ? 200 : 150;
        
        if (currentHandle.includes('e') || currentHandle === 'se') {
            const newWidth = Math.max(minWidth, startWidth + deltaX);
            $window.css('width', newWidth + 'px');
        }
        if (currentHandle.includes('s') || currentHandle === 'se') {
            const newHeight = Math.max(minHeight, startHeight + deltaY);
            $window.css('height', newHeight + 'px');
        }
        
        e.preventDefault();
    }
    
    function endResize() {
        if (isResizing) {
            isResizing = false;
            $window.removeClass('resizing');
            saveSetting('windowWidth', $window[0].offsetWidth);
            saveSetting('windowHeight', $window[0].offsetHeight);
        }
    }
    
    $window.find('.tamako-resize').each(function() {
        this.addEventListener('mousedown', startResize);
        this.addEventListener('touchstart', startResize, { passive: false });
    });
    
    document.addEventListener('mousemove', moveResize);
    document.addEventListener('mouseup', endResize);
    document.addEventListener('touchmove', moveResize, { passive: false });
    document.addEventListener('touchend', endResize);
    document.addEventListener('touchcancel', endResize);
}

function bindWindowEvents($window) {
    $window.find('.tamako-btn.close').on('click', () => toggleWindow(false));
    
    $window.find('.tamako-btn.minimize').on('click', function() {
        $window.toggleClass('minimized');
        $(this).find('i').toggleClass('fa-minus fa-expand');
    });
    
    $window.find('.tamako-btn.scan').on('click', function() {
        const $btn = $(this);
        const $icon = $btn.find('i');
        
        $icon.addClass('fa-spin');
        $btn.prop('disabled', true);
        showDeraToast('scanning');
        
        capturedPlots = [];
        
        setTimeout(() => {
            const result = scanAllMessages();
            $icon.removeClass('fa-spin');
            $btn.prop('disabled', false);
            
            if (result.limited) {
                showDeraToast('tooMany');
            } else if (capturedPlots.length > 0) {
                showDeraToast('found');
            } else {
                showDeraToast('empty');
            }
        }, 100);
    });
    
    $window.find('.tamako-btn.theme-toggle').on('click', () => $('.tamako-theme-panel').slideToggle(200));
    
    $window.find('#tamako-theme-selector').on('change', function() {
        applyTheme(this.value);
        $('.tamako-theme-panel').slideUp(200);
    });
    
    $window.find('.tamako-btn.delete-mode').on('click', () => toggleDeleteMode());
    
    $window.find('#tamako-select-all').on('change', function() {
        $('.tamako-history-item .tamako-checkbox').prop('checked', this.checked);
    });
    
    $window.find('.tamako-delete-confirm').on('click', () => deleteSelectedItems());
    $window.find('.tamako-delete-cancel').on('click', () => toggleDeleteMode(false));
    
    $window.find('.tamako-tab').on('click', function() {
        const tab = $(this).data('tab');
        $window.find('.tamako-tab').removeClass('active');
        $(this).addClass('active');
        $window.find('.tamako-content').hide();
        $window.find(`.tamako-content[data-content="${tab}"]`).show();
    });
    
    let searchTimeout = null;
    $window.find('#tamako-search-input').on('input', function() {
        const query = $(this).val().trim();
        $('.tamako-search-clear').toggle(query.length > 0);
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = query;
            updateHistoryList();
        }, 300);
    });
    
    $window.find('.tamako-search-clear').on('click', function() {
        $('#tamako-search-input').val('');
        searchQuery = '';
        $(this).hide();
        updateHistoryList();
    });
}

function toggleDeleteMode(enable) {
    const $window = $('#tamako-market-window');
    deleteMode = enable ?? !deleteMode;
    
    $window.find('.tamako-delete-bar').toggle(deleteMode);
    $window.find('.tamako-btn.delete-mode').toggleClass('active', deleteMode);
    $window.find('#tamako-select-all').prop('checked', false);
    
    if (deleteMode) $window.find('.tamako-tab[data-tab="history"]').click();
    updateHistoryList();
}

function deleteSelectedItems() {
    const toDelete = [];
    $('.tamako-history-item .tamako-checkbox:checked').each(function() {
        toDelete.push(parseInt($(this).closest('.tamako-history-item').data('index')));
    });
    
    if (toDelete.length === 0) return;
    
    toDelete.sort((a, b) => b - a);
    toDelete.forEach(idx => capturedPlots.splice(idx, 1));
    
    if (capturedPlots.length > 0) {
        updateCurrentContent(capturedPlots[capturedPlots.length - 1].content);
    } else {
        updateCurrentContent('');
    }
    
    toggleDeleteMode(false);
    updateHistoryList();
    showDeraToast('delete');
}

function createToggleButton() {
    if (document.getElementById('tamako-market-toggle')) return;

    const isMobile = isMobileDevice();
    const settings = getSettings();
    
    const btn = document.createElement('div');
    btn.id = 'tamako-market-toggle';
    btn.className = `tamako-toggle theme-tamako ${isMobile ? 'tamako-toggle-mobile' : ''}`;
    btn.innerHTML = '<span class="tamako-toggle-icon">🏪</span><span class="tamako-toggle-text">玉子市场</span>';
    btn.title = '拖拽移动 / 点击打开玉子市场';
    
    document.body.appendChild(btn);
    
    const defaultPos = getDefaultTogglePosition();
    const posX = (settings.toggleX !== null && settings.toggleX !== undefined) ? settings.toggleX : defaultPos.x;
    const posY = (settings.toggleY !== null && settings.toggleY !== undefined) ? settings.toggleY : defaultPos.y;
    
    const $btn = $(btn);
    $btn.css({
        left: posX + 'px',
        top: posY + 'px',
        right: 'auto',
        bottom: 'auto'
    });
    
    initToggleDraggable($btn);
}

function initToggleDraggable($toggle) {
    let isDragging = false;
    let hasMoved = false;
    let offsetX, offsetY;
    let startX, startY;
    let startTime;
    
    const DRAG_THRESHOLD = 5;
    
    function startDrag(e) {
        startTime = Date.now();
        hasMoved = false;
        
        const pos = getEventPosition(e);
        const rect = $toggle[0].getBoundingClientRect();
        
        offsetX = pos.x - rect.left;
        offsetY = pos.y - rect.top;
        startX = pos.x;
        startY = pos.y;
        
        $toggle.addClass('dragging');
        
        e.preventDefault();
    }
    
    function moveDrag(e) {
        if (!$toggle.hasClass('dragging')) return;
        
        const pos = getEventPosition(e);
        
        const deltaX = Math.abs(pos.x - startX);
        const deltaY = Math.abs(pos.y - startY);
        
        if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
            isDragging = true;
            hasMoved = true;
        }
        
        if (!isDragging) return;
        
        const width = $toggle[0].offsetWidth;
        const height = $toggle[0].offsetHeight;
        
        let newX = pos.x - offsetX;
        let newY = pos.y - offsetY;
        
        const constrained = constrainPosition(newX, newY, width, height);
        
        $toggle.css({ 
            left: constrained.x + 'px', 
            top: constrained.y + 'px' 
        });
        
        e.preventDefault();
    }
    
    function endDrag() {
        $toggle.removeClass('dragging');
        isDragging = false;
        
        if (hasMoved) {
            saveSetting('toggleX', parseInt($toggle.css('left')));
            saveSetting('toggleY', parseInt($toggle.css('top')));
        }
        
        if (!hasMoved && Date.now() - startTime < 300) {
            toggleWindow();
        }
        
        hasMoved = false;
    }
    
    $toggle[0].addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);
    
    $toggle[0].addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);
}

function toggleWindow(show) {
    const $window = $('#tamako-market-window');
    const $button = $('#tamako-market-toggle');
    
    show = show ?? !$window.hasClass('visible');
    
    if (show) {
        const rect = $window[0].getBoundingClientRect();
        const constrained = constrainPosition(rect.left, rect.top, rect.width, rect.height);
        
        if (rect.left !== constrained.x || rect.top !== constrained.y) {
            $window.css({ left: constrained.x + 'px', top: constrained.y + 'px' });
        }
    }
    
    $window.toggleClass('visible', show);
    $button.toggleClass('active', show);
    
    if (!show && deleteMode) toggleDeleteMode(false);
}

function updateCurrentContent(content) {
    const $content = $('#tamako-market-window .tamako-content[data-content="current"]');
    
    if (!content?.trim()) {
        $content.html(`<div class="tamako-empty"><span class="icon">🐔</span><span class="message">${getDeraMessage('empty')}</span></div>`);
    } else {
        let formatted = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (searchQuery) formatted = highlightText(formatted, searchQuery);
        formatted = formatted.replace(/\n/g, '<br>');
        $content.html(`<div class="tamako-plot-content">${formatted}</div>`);
    }
}

function filterPlots(plots, query) {
    if (!query) return plots;
    const lowerQuery = query.toLowerCase();
    return plots.filter(plot => {
        const content = plot.content.toLowerCase();
        const amCodes = extractAMCodes(plot.content).join(' ').toLowerCase();
        return content.includes(lowerQuery) || amCodes.includes(lowerQuery);
    });
}

function updateHistoryList() {
    const $list = $('#tamako-market-window .tamako-history-list');
    const filteredPlots = filterPlots(capturedPlots, searchQuery);
    
    $('#tamako-history-count').text(capturedPlots.length);
    
    if (!capturedPlots.length) {
        $list.html(`<div class="tamako-empty"><span class="icon">📦</span><span class="message">${getDeraMessage('empty')}</span></div>`);
        updateCaptureCount();
        return;
    }
    
    if (filteredPlots.length === 0 && searchQuery) {
        $list.html(`<div class="tamako-empty"><span class="icon">🔍</span><span class="message">${getDeraMessage('noResult')}</span></div>`);
        updateCaptureCount();
        return;
    }
    
    let html = '';
    for (let i = filteredPlots.length - 1; i >= 0; i--) {
        const plot = filteredPlots[i];
        const originalIndex = capturedPlots.indexOf(plot);
        const amCodes = extractAMCodes(plot.content);
        const amDisplay = formatAMCodes(amCodes);
        const checkbox = deleteMode ? `<input type="checkbox" class="tamako-checkbox" onclick="event.stopPropagation()">` : '';
        let displayText = searchQuery ? highlightText(amDisplay, searchQuery) : amDisplay;
        
        html += `
            <div class="tamako-history-item ${deleteMode ? 'delete-mode' : ''}" data-index="${originalIndex}">
                ${checkbox}
                <div class="tamako-item-time">📍 第${plot.messageIndex}条消息</div>
                <div class="tamako-item-preview">${displayText}</div>
            </div>
        `;
    }
    
    $list.html(html);
    
    if (!deleteMode) {
        $list.find('.tamako-history-item').on('click', function() {
            const plot = capturedPlots[$(this).data('index')];
            if (plot) {
                updateCurrentContent(plot.content);
                $('#tamako-market-window .tamako-tab[data-tab="current"]').click();
            }
        });
    }
    
    updateCaptureCount();
}

function extractTagContent(message, tagName) {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
    const matches = [];
    let match;
    while ((match = regex.exec(message)) !== null) {
        matches.push(match[0]);
    }
    return matches;
}

function extractPlotContent(message) {
    if (!message) return null;
    if (!extensionEnabled) return null;
    if (!getSettings().autoCapture) return null;
    
    const tags = getSettings().captureTags || [];
    if (tags.length === 0) return null;
    
    // 修复：添加更多关键词变体
    const keywords = [
        '以上是用户的本轮输入',
        '以上是用户本轮输入',
        '以上是用户的',
        '以下是用户的本轮输入',
        '以下是用户本轮输入',
        '以下是用户的'
    ];
    if (!keywords.some(k => message.includes(k))) return null;
    
    const parts = [];
    for (const tag of tags) {
        parts.push(...extractTagContent(message, tag.trim()));
    }
    
    return parts.length > 0 ? parts.join('\n\n') : null;
}


function handleUserMessage(messageIndex) {
    if (!extensionEnabled) return false;
    if (!getSettings().autoCapture) return false;
    
    try {
        const context = SillyTavern.getContext();
        if (!context) return false;
        
        const chat = context.chat;
        if (!chat || messageIndex < 0 || messageIndex >= chat.length) return false;
        
        const message = chat[messageIndex];
        if (!message || !message.is_user || !message.mes) return false;
        
        if (capturedPlots.some(p => p.messageIndex === messageIndex)) return false;
        
        const content = extractPlotContent(message.mes);
        if (!content) return false;
        
        const settings = getSettings();
        capturedPlots.push({ content, timestamp: Date.now(), messageIndex });
        
        if (capturedPlots.length > settings.maxStoredPlots) {
            capturedPlots = capturedPlots.slice(-settings.maxStoredPlots);
        }
        
        capturedPlots.sort((a, b) => a.messageIndex - b.messageIndex);
        
        updateCurrentContent(content);
        updateHistoryList();
        showDeraToast('newItem');
        
        if (!$('#tamako-market-window').hasClass('visible')) {
            $('#tamako-market-toggle').addClass('has-new');
            setTimeout(() => $('#tamako-market-toggle').removeClass('has-new'), 3000);
        }
        
        return true;
    } catch (e) {
        console.error('[玉子市场] 处理消息错误:', e);
        return false;
    }
}

function checkLatestUserMessage() {
    if (!extensionEnabled) return;
    if (!getSettings().autoCapture) return;
    
    try {
        const context = SillyTavern.getContext();
        if (!context || !context.chat) return;
        
        const chat = context.chat;
        
        for (let i = chat.length - 1; i >= 0; i--) {
            if (chat[i] && chat[i].is_user) {
                if (!capturedPlots.some(p => p.messageIndex === i)) {
                    handleUserMessage(i);
                }
                break;
            }
        }
    } catch (e) {
        console.error('[玉子市场] 检查最新消息错误:', e);
    }
}

function scanAllMessages() {
    const result = { limited: false, count: 0 };
    
    if (!extensionEnabled) return result;
    
    try {
        const context = SillyTavern.getContext();
        if (!context || !context.chat) return result;
        
        const chat = context.chat;
        if (!chat.length) return result;
        
        const settings = getSettings();
        const maxScan = settings.maxScanMessages || 50;
        const maxStore = settings.maxStoredPlots || 50;
        
        let latestContent = null;
        let scannedCount = 0;
        let foundCount = 0;
        
        for (let i = chat.length - 1; i >= 0 && scannedCount < maxScan; i--) {
            if (!chat[i] || !chat[i].is_user) continue;
            
            scannedCount++;
            
            const content = extractPlotContent(chat[i].mes);
            if (!content) continue;
            
            if (!capturedPlots.some(p => p.messageIndex === i)) {
                capturedPlots.push({ 
                    content, 
                    timestamp: Date.now() - (chat.length - i) * 1000, 
                    messageIndex: i 
                });
                foundCount++;
                if (!latestContent) latestContent = content;
            }
        }
        
        if (scannedCount >= maxScan) {
            let remaining = 0;
            for (let i = chat.length - scannedCount - 1; i >= 0; i--) {
                if (chat[i] && chat[i].is_user) remaining++;
            }
            if (remaining > 0) result.limited = true;
        }
        
        capturedPlots.sort((a, b) => a.messageIndex - b.messageIndex);
        
        if (capturedPlots.length > maxStore) {
            capturedPlots = capturedPlots.slice(-maxStore);
        }
        
        if (latestContent) updateCurrentContent(latestContent);
        updateHistoryList();
        
        result.count = foundCount;
        
    } catch (e) {
        console.error('[玉子市场] 扫描错误:', e);
    }
    
    return result;
}

function setExtensionEnabled(enabled) {
    extensionEnabled = enabled;
    saveSetting('enabled', enabled);
    
    const $window = $('#tamako-market-window');
    const $button = $('#tamako-market-toggle');
    
    if (enabled) {
        $button.show();
    } else {
        $button.hide();
        $window.removeClass('visible');
    }
}

function createSettingsPanel() {
    if (document.getElementById('tamako-market-settings')) return;
    
    const container = document.getElementById('extensions_settings');
    if (!container) return;

    const settings = getSettings();
    extensionEnabled = settings.enabled !== false;
    const tagsValue = (settings.captureTags || []).join(', ');
    
    const html = `
        <div id="tamako-market-settings" class="extension_settings">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>🏪 玉子市场</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div>
                </div>
                <div class="inline-drawer-content">
                    <div style="padding: 10px;">
                        <label class="checkbox_label">
                            <input type="checkbox" id="tamako-enabled" ${extensionEnabled ? 'checked' : ''}>
                            <span>启用扩展</span>
                        </label>
                        <label class="checkbox_label">
                            <input type="checkbox" id="tamako-auto-capture" ${settings.autoCapture ? 'checked' : ''}>
                            <span>自动捕获</span>
                        </label>
                        
                        <div class="tamako-settings-tags">
                            <label>捕获标签（逗号分隔）:</label>
                            <input type="text" id="tamako-capture-tags" value="${tagsValue}" placeholder="recall, scene_direction">
                            <div class="hint">例如: recall, scene_direction, thoughts</div>
                        </div>
                        
                        <div class="tamako-settings-numbers">
                            <div class="tamako-number-row">
                                <label>扫描消息数:</label>
                                <input type="number" id="tamako-max-scan" value="${settings.maxScanMessages}" min="10" max="500" step="10">
                                <span class="hint">条</span>
                            </div>
                            <div class="tamako-number-row">
                                <label>最大存储数:</label>
                                <input type="number" id="tamako-max-store" value="${settings.maxStoredPlots}" min="10" max="200" step="10">
                                <span class="hint">条</span>
                            </div>
                        </div>
                        
                        <div class="tamako-settings-buttons">
                            <button id="tamako-open-btn" class="menu_button">打开窗口</button>
                            <button id="tamako-reset-btn" class="menu_button tamako-reset">重置窗口</button>
                            <button id="tamako-reset-toggle-btn" class="menu_button">重置按钮</button>
                        </div>
                        <div class="tamako-settings-info">
                            已捕获: <span id="tamako-count">0</span> 条记录
                            <br><small style="color: #888;">💡 提示：可以拖拽"玉子市场"按钮移动位置</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', html);
    
    const $drawer = $('#tamako-market-settings .inline-drawer');
    const $toggle = $drawer.find('.inline-drawer-toggle');
    const $content = $drawer.find('.inline-drawer-content');
    const $icon = $drawer.find('.inline-drawer-icon');
    
    $content.hide();
    
    $toggle.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if ($content.is(':hidden')) {
            $content.slideDown(200);
            $icon.removeClass('fa-circle-chevron-down').addClass('fa-circle-chevron-up');
        } else {
            $content.slideUp(200);
            $icon.removeClass('fa-circle-chevron-up').addClass('fa-circle-chevron-down');
        }
    });
    
    $('#tamako-enabled').on('change', function() { setExtensionEnabled(this.checked); });
    $('#tamako-auto-capture').on('change', function() { saveSetting('autoCapture', this.checked); });
    
    let tagsTimeout = null;
    $('#tamako-capture-tags').on('input', function() {
        clearTimeout(tagsTimeout);
        tagsTimeout = setTimeout(() => {
            const tags = this.value.split(',').map(t => t.trim()).filter(t => t.length > 0);
            saveSetting('captureTags', tags);
        }, 500);
    });
    
    $('#tamako-max-scan').on('change', function() {
        let val = parseInt(this.value) || 50;
        val = Math.max(10, Math.min(500, val));
        this.value = val;
        saveSetting('maxScanMessages', val);
    });
    
    $('#tamako-max-store').on('change', function() {
        let val = parseInt(this.value) || 50;
        val = Math.max(10, Math.min(200, val));
        this.value = val;
        saveSetting('maxStoredPlots', val);
    });
    
    $('#tamako-open-btn').on('click', () => {
        if (!extensionEnabled) {
            setExtensionEnabled(true);
            $('#tamako-enabled').prop('checked', true);
        }
        toggleWindow(true);
    });
    
    $('#tamako-reset-btn').on('click', () => resetWindowPosition());
    $('#tamako-reset-toggle-btn').on('click', () => resetTogglePosition());
    
    if (!extensionEnabled) {
        $('#tamako-market-toggle').hide();
    }
}

function updateCaptureCount() {
    $('#tamako-count').text(capturedPlots.length);
    $('#tamako-history-count').text(capturedPlots.length);
}

function setupMutationObserver() {
    try {
        const chatContainer = document.getElementById('chat');
        if (!chatContainer) {
            setTimeout(setupMutationObserver, 1000);
            return;
        }
        
        let debounceTimer = null;
        
        const observer = new MutationObserver((mutations) => {
            let hasNewMessage = false;
            
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            if (node.classList?.contains('mes') || node.querySelector?.('.mes')) {
                                hasNewMessage = true;
                                break;
                            }
                        }
                    }
                }
                if (hasNewMessage) break;
            }
            
            if (hasNewMessage) {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => checkLatestUserMessage(), 500);
            }
        });
        
        observer.observe(chatContainer, { childList: true, subtree: true });
    } catch (e) {
        console.error('[玉子市场] DOM监听设置失败:', e);
    }
}

function initEventListeners() {
    try {
        const context = SillyTavern.getContext();
        
        if (context?.eventSource) {
            context.eventSource.on('MESSAGE_SENT', (idx) => setTimeout(() => handleUserMessage(idx), 300));
            context.eventSource.on('MESSAGE_RENDERED', (idx) => {
                try {
                    const chat = SillyTavern.getContext()?.chat;
                    if (chat && chat[idx]?.is_user) {
                        setTimeout(() => handleUserMessage(idx), 200);
                    }
                } catch (e) {}
            });
            context.eventSource.on('CHAT_CHANGED', () => {
                capturedPlots = [];
                setTimeout(() => scanAllMessages(), 500);
            });
            context.eventSource.on('GENERATION_STARTED', () => setTimeout(() => checkLatestUserMessage(), 300));
            context.eventSource.on('GENERATION_ENDED', () => setTimeout(() => checkLatestUserMessage(), 300));
        }
        
        setupMutationObserver();
        
    } catch (e) {
        console.error('[玉子市场] 事件监听初始化失败:', e);
        setupMutationObserver();
    }
}

(function init() {
    const onReady = () => {
        try {
            createWindow();
            createToggleButton();
            setTimeout(createSettingsPanel, 2000);
            initEventListeners();
            setTimeout(() => scanAllMessages(), 1000);
            console.log('[玉子市场] 开店啦！🏪✨ v2.1.2');
        } catch (e) {
            console.error('[玉子市场] 初始化错误:', e);
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        setTimeout(onReady, 100);
    }
})();

