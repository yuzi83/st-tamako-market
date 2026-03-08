// modules/window.js
/**
 * 玉子市场 - 窗口管理
 * @version 2.9.0
 */

import { ICONS, themes } from './constants.js';
import {
    getCapturedPlots, getDeleteMode, getSearchQuery,
    resizeState, dragState,
    setCapturedPlots, setDeleteMode, setSearchQuery,
    updateResizeState, updateDragState,
    addEventListenerCleanup
} from './state.js';
import {
    isMobileDevice, getSettings, saveSetting, getDefaultWindowPosition, getDefaultTogglePosition,
    getDefaultPhoneTogglePosition,
    constrainPosition, getDeraMessage, showDeraToast, highlightText,
    extractAMCodes, formatAMCodes, hideBeautifierFrame, showBeautifierFrame,
    getActiveTemplate
} from './utils.js';
import { applyTheme, openThemeEditor, closeThemeEditor } from './theme-editor.js';
import { parseBeautifierTemplate, renderWithBeautifier, getActiveTemplateData } from './beautifier.js';
import { scanAllMessages } from './capture.js';

// ===== 窗口创建 =====

export function createWindow() {
    if (document.getElementById('tamako-market-window')) {
        return $('#tamako-market-window');
    }

    const themeOptions = `<option value="night">夜间模式</option><option value="custom">自定义</option>`;
    
    const mobileClass = isMobileDevice() ? 'tamako-mobile' : '';
    const settings = getSettings();
    const savedTheme = settings.theme || 'night';

    const windowHtml = `
        <div id="tamako-market-window" class="tamako-window theme-${savedTheme === 'custom' ? 'custom' : 'night'} ${mobileClass}">
            <div class="tamako-header">
                <div class="tamako-drag-handle">
                    <div class="tamako-title">
                        <span class="tamako-title-icon">${ICONS.store}</span>
                        <span class="tamako-title-animated">玉子市场</span>
                    </div>
                </div>
                <div class="tamako-controls">
                    <button class="tamako-btn minimize" title="收起">${ICONS.minimize}</button>
                    <button class="tamako-btn scan" title="扫描">${ICONS.search}</button>
                    <button class="tamako-btn delete-mode" title="整理">${ICONS.broom}</button>
                    <button class="tamako-btn theme-toggle" title="主题">${ICONS.palette}</button>
                    <button class="tamako-btn theme-edit" title="编辑">${ICONS.edit}</button>
                    <button class="tamako-btn close" title="关闭">${ICONS.close}</button>
                </div>
            </div>
            <div class="tamako-theme-panel" style="display: none;">
                <select id="tamako-theme-selector">${themeOptions}</select>
            </div>
            <div class="tamako-tabs">
                <button class="tamako-tab active" data-tab="current">${ICONS.star}<span>今日特选</span></button>
                <button class="tamako-tab" data-tab="history">${ICONS.box}<span>库存 (<span id="tamako-history-count">0</span>)</span></button>
            </div>
            <div id="tamako-dera-toast" class="tamako-toast"></div>
            <div class="tamako-content is-active" data-content="current">
                <div class="tamako-empty">
                    <span class="icon">${ICONS.sparkle}</span>
                    <span class="message">${getDeraMessage('empty')}</span>
                </div>
            </div>
            <div class="tamako-content" data-content="history">
                <div class="tamako-search">
                    ${ICONS.search}
                    <input type="text" id="tamako-search-input" placeholder="搜索...">
                    <button class="tamako-search-clear" title="清除" style="display: none;">${ICONS.close}</button>
                </div>
                <div class="tamako-history-list"></div>
            </div>
            <div class="tamako-delete-bar" style="display: none;">
                <label class="tamako-select-all">
                    <input type="checkbox" id="tamako-select-all">
                    <span>全选</span>
                </label>
                <div class="tamako-delete-actions">
                    <button class="tamako-delete-confirm">${ICONS.trash}<span>删除</span></button>
                    <button class="tamako-delete-cancel">取消</button>
                </div>
            </div>
            <div class="tamako-resize tamako-resize-e" data-dir="e"></div>
            <div class="tamako-resize tamako-resize-s" data-dir="s"></div>
            <div class="tamako-resize tamako-resize-se" data-dir="se"></div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', windowHtml);
    
    const $window = $('#tamako-market-window');
    const defaultPos = getDefaultWindowPosition();
    
    $window.css({
        left: (settings.windowX ?? defaultPos.x) + 'px',
        top: (settings.windowY ?? defaultPos.y) + 'px',
        width: (settings.windowWidth || defaultPos.width) + 'px',
        height: (settings.windowHeight || defaultPos.height) + 'px'
    });
    
    $('#tamako-theme-selector').val(savedTheme === 'custom' ? 'custom' : 'night');
    
    if (savedTheme === 'custom' && settings.customTheme) {
        applyTheme('custom', settings.customTheme);
    } else {
        applyTheme('night');
    }
    
    initDraggable($window);
    initResizable($window);
    bindWindowEvents($window);
    
    return $window;
}

// ===== 拖拽 =====

function initDraggable($window) {
    const header = $window.find('.tamako-header')[0];
    
    function onHeaderContextMenu(e) {
        e.preventDefault();
    }
    header.addEventListener('contextmenu', onHeaderContextMenu);
    addEventListenerCleanup(header, 'contextmenu', onHeaderContextMenu);
    
    function onPointerDown(e) {
        if (e.target.closest('.tamako-btn, .tamako-controls')) return;
        
        updateDragState({
            isDragging: true,
            pointerId: e.pointerId
        });
        
        const rect = $window[0].getBoundingClientRect();
        updateDragState({
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top
        });
        
        header.setPointerCapture(e.pointerId);
        $window.addClass('dragging');
        hideBeautifierFrame($window);
        
        e.preventDefault();
    }
    
    function onPointerMove(e) {
        if (!dragState.isDragging || e.pointerId !== dragState.pointerId) return;
        
        const constrained = constrainPosition(
            e.clientX - dragState.offsetX,
            e.clientY - dragState.offsetY,
            $window[0].offsetWidth,
            $window[0].offsetHeight
        );
        
        $window[0].style.left = constrained.x + 'px';
        $window[0].style.top = constrained.y + 'px';
        
        e.preventDefault();
    }
    
    function onPointerUp(e) {
        if (!dragState.isDragging || e.pointerId !== dragState.pointerId) return;
        
        updateDragState({ isDragging: false });
        
        try {
            header.releasePointerCapture(e.pointerId);
        } catch (err) {}
        
        $window.removeClass('dragging');
        showBeautifierFrame($window);
        
        saveSetting('windowX', parseInt($window.css('left')));
        saveSetting('windowY', parseInt($window.css('top')));
        
        updateDragState({ pointerId: null });
    }
    
    header.addEventListener('pointerdown', onPointerDown);
    header.addEventListener('pointermove', onPointerMove);
    header.addEventListener('pointerup', onPointerUp);
    header.addEventListener('pointercancel', onPointerUp);
    addEventListenerCleanup(header, 'pointerdown', onPointerDown);
    addEventListenerCleanup(header, 'pointermove', onPointerMove);
    addEventListenerCleanup(header, 'pointerup', onPointerUp);
    addEventListenerCleanup(header, 'pointercancel', onPointerUp);
}

// ===== 缩放 =====

function initResizable($window) {
    const minWidth = isMobileDevice() ? 260 : 280;
    const minHeight = isMobileDevice() ? 200 : 150;
    
    $window.find('.tamako-resize').each(function() {
        const handle = this;
        
        function onHandleContextMenu(e) {
            e.preventDefault();
        }
        handle.addEventListener('contextmenu', onHandleContextMenu);
        addEventListenerCleanup(handle, 'contextmenu', onHandleContextMenu);
        
        function onPointerDown(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const dir = handle.getAttribute('data-dir');
            const rect = $window[0].getBoundingClientRect();
            
            updateResizeState({
                isResizing: true,
                handle: dir,
                startX: e.clientX,
                startY: e.clientY,
                startWidth: rect.width,
                startHeight: rect.height,
                element: handle,
                pointerId: e.pointerId
            });
            
            handle.setPointerCapture(e.pointerId);
            
            hideBeautifierFrame($window);
            $window.addClass('resizing');
            document.body.classList.add('tamako-resizing');
        }
        
        function onPointerMove(e) {
            if (!resizeState.isResizing || e.pointerId !== resizeState.pointerId) return;
            
            e.preventDefault();
            
            const deltaX = e.clientX - resizeState.startX;
            const deltaY = e.clientY - resizeState.startY;
            
            if (resizeState.handle.includes('e') || resizeState.handle === 'se') {
                const newWidth = Math.max(minWidth, resizeState.startWidth + deltaX);
                $window[0].style.width = newWidth + 'px';
            }
            if (resizeState.handle.includes('s') || resizeState.handle === 'se') {
                const newHeight = Math.max(minHeight, resizeState.startHeight + deltaY);
                $window[0].style.height = newHeight + 'px';
            }
        }
        
        function onPointerUp(e) {
            if (!resizeState.isResizing || e.pointerId !== resizeState.pointerId) return;
            
            updateResizeState({ isResizing: false });
            
            try {
                handle.releasePointerCapture(e.pointerId);
            } catch (err) {}
            
            $window.removeClass('resizing');
            document.body.classList.remove('tamako-resizing');
            showBeautifierFrame($window);
            
            saveSetting('windowWidth', $window[0].offsetWidth);
            saveSetting('windowHeight', $window[0].offsetHeight);
            
            updateResizeState({
                handle: '',
                element: null,
                pointerId: null
            });
        }
        
        handle.addEventListener('pointerdown', onPointerDown);
        handle.addEventListener('pointermove', onPointerMove);
        handle.addEventListener('pointerup', onPointerUp);
        handle.addEventListener('pointercancel', onPointerUp);
        addEventListenerCleanup(handle, 'pointerdown', onPointerDown);
        addEventListenerCleanup(handle, 'pointermove', onPointerMove);
        addEventListenerCleanup(handle, 'pointerup', onPointerUp);
        addEventListenerCleanup(handle, 'pointercancel', onPointerUp);
    });
}

// ===== 窗口事件 =====

function bindWindowEvents($window) {
    $window.find('.tamako-btn.close').on('click', () => toggleWindow(false));
    
    $window.find('.tamako-btn.minimize').on('click', function() {
        const isMinimized = $window.toggleClass('minimized').hasClass('minimized');
        $(this).html(isMinimized ? ICONS.expand : ICONS.minimize);
    });
    
    $window.find('.tamako-btn.scan').on('click', function() {
        const $btn = $(this);
        $btn.prop('disabled', true);
        showDeraToast('scanning');
        setCapturedPlots([]);
        
        setTimeout(() => {
            const result = scanAllMessages({
                onUpdate: updateCurrentContent,
                onHistoryUpdate: updateHistoryList
            });
            $btn.prop('disabled', false);
            const capturedPlots = getCapturedPlots();
            showDeraToast(result.limited ? 'tooMany' : (capturedPlots.length > 0 ? 'found' : 'empty'));
        }, 50);
    });
    
    $window.find('.tamako-btn.theme-toggle').on('click', () => {
        $('.tamako-theme-panel').slideToggle(200);
    });
    
    $window.find('#tamako-theme-selector').on('change', function() {
        const themeName = this.value;
        if (themeName === 'custom') {
            const settings = getSettings();
            if (settings.customTheme) {
                applyTheme('custom', settings.customTheme);
            } else {
                openThemeEditor();
            }
        } else {
            applyTheme('night');
        }
        $('.tamako-theme-panel').slideUp(200);
    });
    
    $window.find('.tamako-btn.theme-edit').on('click', () => openThemeEditor());
    
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
        $window.find('.tamako-content').removeClass('is-active');
        $window.find(`.tamako-content[data-content="${tab}"]`).addClass('is-active');
    });
    
    let searchTimeout = null;
    $window.find('#tamako-search-input').on('input', function() {
        const query = $(this).val().trim();
        $('.tamako-search-clear').toggle(query.length > 0);
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            setSearchQuery(query);
            updateHistoryList();
        }, 300);
    });
    
    $window.find('.tamako-search-clear').on('click', function() {
        $('#tamako-search-input').val('');
        setSearchQuery('');
        $(this).hide();
        updateHistoryList();
    });
}

// ===== 删除模式 =====

export function toggleDeleteMode(enable) {
    const $window = $('#tamako-market-window');
    const deleteMode = getDeleteMode();
    const newMode = enable ?? !deleteMode;
    setDeleteMode(newMode);
    
    $window.find('.tamako-delete-bar').toggle(newMode);
    $window.find('.tamako-btn.delete-mode').toggleClass('active', newMode);
    $window.find('#tamako-select-all').prop('checked', false);
    
    if (newMode) {
        $window.find('.tamako-tab[data-tab="history"]').click();
    }
    
    updateHistoryList();
}

function deleteSelectedItems() {
    const toDelete = [];
    $('.tamako-history-item .tamako-checkbox:checked').each(function() {
        toDelete.push(parseInt($(this).closest('.tamako-history-item').data('index')));
    });
    
    if (toDelete.length === 0) return;
    
    const capturedPlots = getCapturedPlots();
    const newPlots = [...capturedPlots];
    toDelete.sort((a, b) => b - a).forEach(idx => newPlots.splice(idx, 1));
    setCapturedPlots(newPlots);
    
    const updatedPlots = getCapturedPlots();
    if (updatedPlots.length > 0) {
        const latest = updatedPlots[updatedPlots.length - 1];
        updateCurrentContent(latest.content, latest.rawMessage);
    } else {
        updateCurrentContent('', '');
    }
    
    toggleDeleteMode(false);
    updateHistoryList();
    showDeraToast('delete');
}

// ===== 窗口开关 =====

export function toggleWindow(show) {
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
    
    const deleteMode = getDeleteMode();
    if (!show && deleteMode) toggleDeleteMode(false);
    
    import('./state.js').then(state => {
        if (!show && state.isThemeEditorOpen) {
            closeThemeEditor(false);
        }
    });
}

// ===== 内容更新 =====

export function updateCurrentContent(content, rawMessage) {
    const $content = $('#tamako-market-window .tamako-content[data-content="current"]');
    const settings = getSettings();
    const searchQuery = getSearchQuery();
    
    if (!content?.trim()) {
        // 释放 blob URL 防止内存泄漏
        const $oldIframe = $content.find('.tamako-beautifier-frame');
        if ($oldIframe.length && $oldIframe[0]._blobUrl) {
            URL.revokeObjectURL($oldIframe[0]._blobUrl);
            $oldIframe[0]._blobUrl = null;
        }
        $content.css('position', '').empty().html(`
            <div class="tamako-empty">
                <span class="icon">${ICONS.sparkle}</span>
                <span class="message">${getDeraMessage('empty')}</span>
            </div>
        `);
        return;
    }
    
    if (settings.beautifier?.enabled && settings.beautifier?.activeTemplateId) {
        const templateData = getActiveTemplateData();
        if (templateData && rawMessage) {
            if (renderWithBeautifier($content, rawMessage, templateData)) {
                return;
            }
        }
    }
    
    $content.css('position', '');
    
    // 释放 blob URL 防止内存泄漏
    const $oldIframe = $content.find('.tamako-beautifier-frame');
    if ($oldIframe.length && $oldIframe[0]._blobUrl) {
        URL.revokeObjectURL($oldIframe[0]._blobUrl);
        $oldIframe[0]._blobUrl = null;
    }
    $content.find('.tamako-beautifier-frame, .tamako-beautifier-loading').remove();
    
    let formatted = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (searchQuery) formatted = highlightText(formatted, searchQuery);
    
    $content.html(`<div class="tamako-plot-content"><div>${formatted.replace(/\n/g, '<br>')}</div></div>`);
}

export function updateHistoryList() {
    const $list = $('#tamako-market-window .tamako-history-list');
    const capturedPlots = getCapturedPlots();
    const deleteMode = getDeleteMode();
    const searchQuery = getSearchQuery();
    
    const filteredPlots = filterPlots(capturedPlots, searchQuery);
    
    $('#tamako-history-count').text(capturedPlots.length);
    
    if (!capturedPlots.length) {
        $list.html(`<div class="tamako-empty"><span class="icon">${ICONS.boxEmpty}</span><span class="message">${getDeraMessage('empty')}</span></div>`);
        updateCaptureCount();
        return;
    }
    
    if (filteredPlots.length === 0 && searchQuery) {
        $list.html(`<div class="tamako-empty"><span class="icon">${ICONS.search}</span><span class="message">${getDeraMessage('noResult')}</span></div>`);
        updateCaptureCount();
        return;
    }
    
    let html = '';
    for (let i = filteredPlots.length - 1; i >= 0; i--) {
        const plot = filteredPlots[i];
        const originalIndex = capturedPlots.indexOf(plot);
        const amDisplay = formatAMCodes(extractAMCodes(plot.content));
        const checkbox = deleteMode ? `<input type="checkbox" class="tamako-checkbox" onclick="event.stopPropagation()">` : '';
        const displayText = searchQuery ? highlightText(amDisplay, searchQuery) : amDisplay;
        
        html += `
            <div class="tamako-history-item ${deleteMode ? 'delete-mode' : ''}" data-index="${originalIndex}">
                ${checkbox}
                <div class="tamako-item-time">${ICONS.pin} 第${plot.messageIndex}条消息</div>
                <div class="tamako-item-preview">${displayText}</div>
            </div>
        `;
    }
    
    $list.html(html);
    
    if (!deleteMode) {
        $list.find('.tamako-history-item').on('click', function() {
            const currentPlots = getCapturedPlots();
            const plot = currentPlots[$(this).data('index')];
            if (plot) {
                updateCurrentContent(plot.content, plot.rawMessage);
                $('#tamako-market-window .tamako-tab[data-tab="current"]').click();
            }
        });
    }
    
    updateCaptureCount();
}

function filterPlots(plots, query) {
    if (!query) return plots;
    const lowerQuery = query.toLowerCase();
    return plots.filter(p => {
        return p.content.toLowerCase().includes(lowerQuery) || 
               extractAMCodes(p.content).join(' ').toLowerCase().includes(lowerQuery);
    });
}

export function updateCaptureCount() {
    const capturedPlots = getCapturedPlots();
    $('#tamako-count').text(capturedPlots.length);
    $('#tamako-history-count').text(capturedPlots.length);
}

// ===== 位置重置 =====

export function resetWindowPosition() {
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
    $window.find('.tamako-btn.minimize').html(ICONS.minimize);
    
    toggleWindow(true);
}

export function resetTogglePosition() {
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

export function resetPhoneTogglePosition() {
    const $toggle = $('#tamako-phone-toggle');
    const pos = getDefaultPhoneTogglePosition();
    
    saveSetting('phoneToggleX', null);
    saveSetting('phoneToggleY', null);
    
    $toggle.css({
        left: pos.x + 'px',
        top: pos.y + 'px',
        right: 'auto',
        bottom: 'auto'
    });
}

// ===== 独立手机 =====

export function createPhoneContainer() {
    if (document.getElementById('tamako-phone-standalone')) {
        return $('#tamako-phone-standalone');
    }

    const settings = getSettings();

    // 只创建一个裸定位容器，phone-core 会在里面渲染 phone-shell + 缩放句柄
    const phoneHtml = `<div id="tamako-phone-standalone" class="tamako-phone-standalone"></div>`;
    document.body.insertAdjacentHTML('beforeend', phoneHtml);

    const $phone = $('#tamako-phone-standalone');

    const defaultWidth = 320;
    const defaultHeight = 640;
    const savedWidth = Number(settings.phoneContainerWidth);
    const savedHeight = Number(settings.phoneContainerHeight);
    const width = Number.isFinite(savedWidth) && savedWidth > 0 ? savedWidth : defaultWidth;
    const height = Number.isFinite(savedHeight) && savedHeight > 0 ? savedHeight : defaultHeight;

    // 默认位置：屏幕右侧偏下
    const defaultX = Math.max(10, window.innerWidth - width - 40);
    const defaultY = Math.max(60, Math.floor((window.innerHeight - height) / 2));
    const savedX = Number(settings.phoneContainerX);
    const savedY = Number(settings.phoneContainerY);
    const initialX = Number.isFinite(savedX) ? savedX : defaultX;
    const initialY = Number.isFinite(savedY) ? savedY : defaultY;
    const constrained = constrainPosition(initialX, initialY, width, height);

    $phone.css({
        left: constrained.x + 'px',
        top: constrained.y + 'px',
        width: width + 'px',
        height: height + 'px'
    });

    return $phone;
}

/**
 * 在手机 shell 渲染完成后初始化拖拽
 * 拖拽区域 = phone-notch + phone-status-bar（手机顶部区域）
 */
export function initPhoneShellDrag() {
    const $phone = $('#tamako-phone-standalone');
    const shell = $phone.find('.phone-shell')[0];
    if (!shell) return;

    // 用 notch 和 status-bar 作为拖拽把手
    const notch = shell.querySelector('.phone-notch');
    const statusBar = shell.querySelector('.phone-status-bar');

    let isDragging = false;
    let offsetX = 0, offsetY = 0;
    let pointerId = null;

    function onContextMenu(e) { e.preventDefault(); }

    function onPointerDown(e) {
        if ($phone.hasClass('resizing')) return;

        isDragging = true;
        pointerId = e.pointerId;
        const rect = $phone[0].getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        e.target.setPointerCapture(e.pointerId);
        $phone.addClass('dragging');
        e.preventDefault();
    }

    function onPointerMove(e) {
        if (!isDragging || e.pointerId !== pointerId) return;
        const constrained = constrainPosition(
            e.clientX - offsetX,
            e.clientY - offsetY,
            $phone[0].offsetWidth,
            $phone[0].offsetHeight
        );
        $phone[0].style.left = constrained.x + 'px';
        $phone[0].style.top = constrained.y + 'px';
        e.preventDefault();
    }

    function onPointerUp(e) {
        if (!isDragging || e.pointerId !== pointerId) return;
        isDragging = false;
        try { e.target.releasePointerCapture(e.pointerId); } catch (err) {}
        $phone.removeClass('dragging');
        saveSetting('phoneContainerX', parseInt($phone.css('left')));
        saveSetting('phoneContainerY', parseInt($phone.css('top')));
        pointerId = null;
    }

    // 给 notch 和 status-bar 都加上拖拽
    [notch, statusBar].forEach(el => {
        if (!el) return;
        el.style.cursor = 'grab';
        el.style.touchAction = 'none';
        el.style.pointerEvents = 'auto';
        el.addEventListener('contextmenu', onContextMenu);
        el.addEventListener('pointerdown', onPointerDown);
        el.addEventListener('pointermove', onPointerMove);
        el.addEventListener('pointerup', onPointerUp);
        el.addEventListener('pointercancel', onPointerUp);
        addEventListenerCleanup(el, 'contextmenu', onContextMenu);
        addEventListenerCleanup(el, 'pointerdown', onPointerDown);
        addEventListenerCleanup(el, 'pointermove', onPointerMove);
        addEventListenerCleanup(el, 'pointerup', onPointerUp);
        addEventListenerCleanup(el, 'pointercancel', onPointerUp);
    });
}

/**
 * 在手机 shell 渲染完成后初始化缩放
 * 缩放区域 = 右侧(e) + 右下角(se)
 */
export function initPhoneShellResize() {
    const $phone = $('#tamako-phone-standalone');
    if (!$phone.length) return;

    $phone.find('.tamako-phone-resize').each(function() {
        const handle = this;

        if (handle.dataset.resizeBound === '1') return;
        handle.dataset.resizeBound = '1';

        let isResizing = false;
        let pointerId = null;
        let dir = '';
        let startX = 0;
        let startY = 0;
        let startWidth = 0;
        let startHeight = 0;
        let startLeft = 0;
        let startTop = 0;

        function onContextMenu(e) {
            e.preventDefault();
        }

        function onPointerDown(e) {
            e.preventDefault();
            e.stopPropagation();

            dir = handle.getAttribute('data-dir') || '';
            const rect = $phone[0].getBoundingClientRect();

            isResizing = true;
            pointerId = e.pointerId;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = rect.width;
            startHeight = rect.height;
            startLeft = rect.left;
            startTop = rect.top;

            handle.setPointerCapture(e.pointerId);
            $phone.addClass('resizing');
        }

        function onPointerMove(e) {
            if (!isResizing || e.pointerId !== pointerId) return;

            e.preventDefault();

            const minWidth = Math.min(280, window.innerWidth);
            const minHeight = Math.min(520, window.innerHeight);
            const maxWidth = Math.max(minWidth, window.innerWidth - startLeft);
            const maxHeight = Math.max(minHeight, window.innerHeight - startTop);

            let nextWidth = startWidth;
            let nextHeight = startHeight;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            if (dir.includes('e')) {
                nextWidth = Math.max(minWidth, Math.min(startWidth + deltaX, maxWidth));
            }
            if (dir.includes('s')) {
                nextHeight = Math.max(minHeight, Math.min(startHeight + deltaY, maxHeight));
            }

            $phone[0].style.width = Math.round(nextWidth) + 'px';
            $phone[0].style.height = Math.round(nextHeight) + 'px';
        }

        function onPointerUp(e) {
            if (!isResizing || e.pointerId !== pointerId) return;

            isResizing = false;

            try {
                handle.releasePointerCapture(e.pointerId);
            } catch (err) {}

            $phone.removeClass('resizing');

            const left = parseInt($phone.css('left')) || 0;
            const top = parseInt($phone.css('top')) || 0;
            const constrained = constrainPosition(left, top, $phone[0].offsetWidth, $phone[0].offsetHeight);

            $phone.css({
                left: constrained.x + 'px',
                top: constrained.y + 'px'
            });

            saveSetting('phoneContainerX', constrained.x);
            saveSetting('phoneContainerY', constrained.y);
            saveSetting('phoneContainerWidth', $phone[0].offsetWidth);
            saveSetting('phoneContainerHeight', $phone[0].offsetHeight);

            pointerId = null;
            dir = '';
        }

        handle.addEventListener('contextmenu', onContextMenu);
        handle.addEventListener('pointerdown', onPointerDown);
        handle.addEventListener('pointermove', onPointerMove);
        handle.addEventListener('pointerup', onPointerUp);
        handle.addEventListener('pointercancel', onPointerUp);
        addEventListenerCleanup(handle, 'contextmenu', onContextMenu);
        addEventListenerCleanup(handle, 'pointerdown', onPointerDown);
        addEventListenerCleanup(handle, 'pointermove', onPointerMove);
        addEventListenerCleanup(handle, 'pointerup', onPointerUp);
        addEventListenerCleanup(handle, 'pointercancel', onPointerUp);
    });
}

export function togglePhone(show) {
    const $phone = $('#tamako-phone-standalone');
    const $button = $('#tamako-phone-toggle');
    show = show ?? !$phone.hasClass('visible');

    if (show) {
        const settings = getSettings();
        const hasSavedWidth = Number.isFinite(Number(settings.phoneContainerWidth));
        const hasSavedHeight = Number.isFinite(Number(settings.phoneContainerHeight));

        const rect = $phone[0].getBoundingClientRect();
        const minWidth = Math.min(280, window.innerWidth);
        const minHeight = Math.min(520, window.innerHeight);

        let targetWidth = rect.width;
        let targetHeight = rect.height;

        // 有历史尺寸时优先保留历史尺寸；无历史尺寸时才按可视区约束并写回
        if (hasSavedWidth || hasSavedHeight) {
            const savedWidth = Number(settings.phoneContainerWidth);
            const savedHeight = Number(settings.phoneContainerHeight);
            targetWidth = Number.isFinite(savedWidth) ? savedWidth : rect.width;
            targetHeight = Number.isFinite(savedHeight) ? savedHeight : rect.height;
        }

        const nextWidth = Math.max(minWidth, Math.min(targetWidth, window.innerWidth));
        const nextHeight = Math.max(minHeight, Math.min(targetHeight, window.innerHeight));

        if (Math.round(nextWidth) !== Math.round(rect.width) || Math.round(nextHeight) !== Math.round(rect.height)) {
            $phone.css({
                width: Math.round(nextWidth) + 'px',
                height: Math.round(nextHeight) + 'px'
            });

            if (!hasSavedWidth || !hasSavedHeight) {
                saveSetting('phoneContainerWidth', Math.round(nextWidth));
                saveSetting('phoneContainerHeight', Math.round(nextHeight));
            }
        }

        const constrained = constrainPosition(rect.left, rect.top, nextWidth, nextHeight);
        if (Math.round(rect.left) !== constrained.x || Math.round(rect.top) !== constrained.y) {
            $phone.css({ left: constrained.x + 'px', top: constrained.y + 'px' });
            saveSetting('phoneContainerX', constrained.x);
            saveSetting('phoneContainerY', constrained.y);
        }
    }

    $phone.toggleClass('visible', show);
    $button.toggleClass('active', show);

    // 激活手机界面
    if (show) {
        import('./phone/phone-core.js').then(mod => mod.onPhoneActivated());
    }
}

