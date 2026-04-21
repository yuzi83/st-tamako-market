// modules/window.js
/**
 * 玉子市场 - 窗口管理
 * @version 2.8.5
 */

import { ICONS } from './constants.js';
import {
    getCapturedPlots, getDeleteMode,
    resizeState, dragState,
    setCapturedPlots, setSearchQuery,
    updateResizeState, updateDragState,
    initEventListenerManager
} from './state.js';
import {
    isMobileDevice, getDefaultWindowPosition, getDefaultTogglePosition,
    constrainPosition, getDeraMessage, showDeraToast, hideBeautifierFrame, showBeautifierFrame
} from './utils.js';
import { getSettings, saveSetting } from './settings.js';
import { applyTheme } from './theme-application.js';
import { openThemeEditor, closeThemeEditor } from './theme-editor.js';
import { scanAllMessages } from './capture.js';
import { updateCurrentContent as renderCurrentContent } from './window-content.js';
import {
    toggleDeleteMode as toggleHistoryDeleteMode,
    deleteSelectedItems as deleteHistorySelectedItems,
    updateHistoryList as renderHistoryList,
    updateCaptureCount as syncCaptureCount,
} from './window-history.js';

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
            <div class="tamako-content" data-content="current">
                <div class="tamako-empty">
                    <span class="icon">${ICONS.sparkle}</span>
                    <span class="message">${getDeraMessage('empty')}</span>
                </div>
            </div>
            <div class="tamako-content" data-content="history" style="display: none;">
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
    const manager = initEventListenerManager();
    
    function onHeaderContextMenu(e) {
        e.preventDefault();
    }
    header.addEventListener('contextmenu', onHeaderContextMenu);
    manager.register(header, 'contextmenu', onHeaderContextMenu);
    
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
    manager.register(header, 'pointerdown', onPointerDown);
    manager.register(header, 'pointermove', onPointerMove);
    manager.register(header, 'pointerup', onPointerUp);
    manager.register(header, 'pointercancel', onPointerUp);
}

// ===== 缩放 =====

function initResizable($window) {
    const minWidth = isMobileDevice() ? 260 : 280;
    const minHeight = isMobileDevice() ? 200 : 150;
    
    const manager = initEventListenerManager();

    $window.find('.tamako-resize').each(function() {
        const handle = this;
        
        function onHandleContextMenu(e) {
            e.preventDefault();
        }
        handle.addEventListener('contextmenu', onHandleContextMenu);
        manager.register(handle, 'contextmenu', onHandleContextMenu);
        
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
        manager.register(handle, 'pointerdown', onPointerDown);
        manager.register(handle, 'pointermove', onPointerMove);
        manager.register(handle, 'pointerup', onPointerUp);
        manager.register(handle, 'pointercancel', onPointerUp);
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
        $window.find('.tamako-content').hide();
        $window.find(`.tamako-content[data-content="${tab}"]`).show();
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
    toggleHistoryDeleteMode(enable);
}

function deleteSelectedItems() {
    deleteHistorySelectedItems();
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
    renderCurrentContent(content, rawMessage);
}

export function updateHistoryList() {
    renderHistoryList();
}

export function updateCaptureCount() {
    syncCaptureCount();
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

