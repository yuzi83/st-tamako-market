// index.js
/**
 * 玉子市场 - SillyTavern 悬浮窗扩展
 * @version 2.9.0
 */

import { ICONS, themes } from './modules/constants.js';
import { PHONE_ICONS } from './modules/phone/phone-home.js';
import {
    extensionEnabled, phoneEnabled, setCapturedPlots, getCapturedPlots,
    setMutationObserver, disconnectObserver, clearAllEventListeners,
    addEventListenerCleanup, addEventSourceListenerCleanup, clearAllEventSourceListeners,
    setExtensionEnabled, setPhoneEnabled
} from './modules/state.js';
import {
    isMobileDevice, getSettings, saveSetting, getDefaultTogglePosition, getDefaultPhoneTogglePosition,
    constrainPosition, showDeraToast, applyButtonStyles
} from './modules/utils.js';
import { applyTheme } from './modules/theme-editor.js';
import { handleUserMessage, checkLatestUserMessage, scanAllMessages, validateCapturedPlots } from './modules/capture.js';
import { createWindow, toggleWindow, createPhoneContainer, togglePhone, updateCurrentContent, updateHistoryList } from './modules/window.js';
import { createSettingsPanel, updateCaptureCount } from './modules/settings-panel.js';

// ===== 切换按钮 =====

function createToggleButton() {
    if (document.getElementById('tamako-market-toggle')) return;

    const settings = getSettings();
    const isMobile = isMobileDevice();
    const savedTheme = settings.theme || 'night';
    
    const btn = document.createElement('div');
    btn.id = 'tamako-market-toggle';
    btn.className = `tamako-toggle theme-${savedTheme === 'custom' ? 'custom' : 'night'} ${isMobile ? 'tamako-toggle-mobile' : ''}`;
    btn.innerHTML = `<span class="tamako-toggle-icon">${ICONS.store}</span><span class="tamako-toggle-text">玉子市场</span>`;
    btn.title = '拖拽移动 / 点击打开';
    document.body.appendChild(btn);
    
    const defaultPos = getDefaultTogglePosition();
    const $btn = $(btn);
    
    $btn.css({ 
        left: (settings.toggleX ?? defaultPos.x) + 'px', 
        top: (settings.toggleY ?? defaultPos.y) + 'px', 
        right: 'auto', 
        bottom: 'auto'
    });
    
    // 应用主题和按钮样式
    if (savedTheme === 'custom' && settings.customTheme) {
        $btn.css({
            '--theme-primary': settings.customTheme.colors.primary,
            '--theme-secondary': settings.customTheme.colors.secondary
        });
        applyButtonStyles(settings.customTheme, $btn);
    } else {
        const theme = themes.night;
        $btn.css({
            '--theme-primary': theme.primary,
            '--theme-secondary': theme.secondary
        });
        applyButtonStyles({
            colors: { primary: theme.primary, secondary: theme.secondary },
            buttonShape: 'bar',
            buttonSize: 1.0,
            buttonImage: null
        }, $btn);
    }
    
    initToggleDraggable($btn);
}

function initToggleDraggable($toggle) {
    const btn = $toggle[0];
    let hasMoved = false;
    let startX, startY, startTime;
    let offsetX, offsetY;
    let pointerId = null;
    const DRAG_THRESHOLD = 5;
    
    function onContextMenu(e) {
        e.preventDefault();
    }
    btn.addEventListener('contextmenu', onContextMenu);
    addEventListenerCleanup(btn, 'contextmenu', onContextMenu);
    
    function onPointerDown(e) {
        startTime = Date.now();
        hasMoved = false;
        pointerId = e.pointerId;
        
        const rect = btn.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        startX = e.clientX;
        startY = e.clientY;
        
        btn.setPointerCapture(e.pointerId);
        $toggle.addClass('dragging');
        
        e.preventDefault();
    }
    
    function onPointerMove(e) {
        if (e.pointerId !== pointerId) return;
        
        if (Math.abs(e.clientX - startX) > DRAG_THRESHOLD || Math.abs(e.clientY - startY) > DRAG_THRESHOLD) {
            hasMoved = true;
        }
        
        if (!hasMoved) return;
        
        // 直接设置位置，不使用 jQuery 动画
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        
        const constrained = constrainPosition(newX, newY, btn.offsetWidth, btn.offsetHeight);
        
        btn.style.left = constrained.x + 'px';
        btn.style.top = constrained.y + 'px';
        
        e.preventDefault();
    }
    
    function onPointerUp(e) {
        if (e.pointerId !== pointerId) return;
        
        try {
            btn.releasePointerCapture(e.pointerId);
        } catch (err) {}
        
        $toggle.removeClass('dragging');
        
        if (hasMoved) {
            saveSetting('toggleX', parseInt(btn.style.left));
            saveSetting('toggleY', parseInt(btn.style.top));
        }
        
        if (!hasMoved && Date.now() - startTime < 300) {
            toggleWindow();
        }
        
        hasMoved = false;
        pointerId = null;
    }
    
    btn.addEventListener('pointerdown', onPointerDown);
    btn.addEventListener('pointermove', onPointerMove);
    btn.addEventListener('pointerup', onPointerUp);
    btn.addEventListener('pointercancel', onPointerUp);
    addEventListenerCleanup(btn, 'pointerdown', onPointerDown);
    addEventListenerCleanup(btn, 'pointermove', onPointerMove);
    addEventListenerCleanup(btn, 'pointerup', onPointerUp);
    addEventListenerCleanup(btn, 'pointercancel', onPointerUp);
}

// ===== 手机切换按钮 =====

function createPhoneToggleButton() {
    if (document.getElementById('tamako-phone-toggle')) return;

    const settings = getSettings();
    const isMobile = isMobileDevice();

    const btn = document.createElement('div');
    btn.id = 'tamako-phone-toggle';
    btn.className = `tamako-toggle tamako-toggle-phone theme-night ${isMobile ? 'tamako-toggle-mobile' : ''}`;
    btn.innerHTML = `<span class="tamako-toggle-icon">${PHONE_ICONS.phone}</span><span class="tamako-toggle-text">玉子的手机</span>`;
    btn.title = '拖拽移动 / 点击打开';
    document.body.appendChild(btn);

    const defaultPos = getDefaultPhoneTogglePosition();
    const $btn = $(btn);

    $btn.css({
        left: (settings.phoneToggleX ?? defaultPos.x) + 'px',
        top: (settings.phoneToggleY ?? defaultPos.y) + 'px',
        right: 'auto',
        bottom: 'auto'
    });

    // 手机按钮的默认样式：渐变色条形
    $btn.css({
        'background': 'linear-gradient(135deg, #5AC8FA 0%, #007AFF 100%)',
        'border': '2px solid rgba(255,255,255,0.3)',
        'border-radius': '12px',
        'padding': '8px 14px',
        'display': 'flex',
        'align-items': 'center',
        'gap': '6px'
    });

    $btn.find('.tamako-toggle-icon').css({ width: '18px', height: '18px' }).find('svg').css({ width: '100%', height: '100%' });
    $btn.find('.tamako-toggle-text').css({ 'font-size': '14px', 'font-weight': '600', 'color': '#FFFFFF' });

    initPhoneToggleDraggable($btn);
}

function initPhoneToggleDraggable($toggle) {
    const btn = $toggle[0];
    let hasMoved = false;
    let startX, startY, startTime;
    let offsetX, offsetY;
    let pointerId = null;
    const DRAG_THRESHOLD = 5;

    function onContextMenu(e) { e.preventDefault(); }
    btn.addEventListener('contextmenu', onContextMenu);
    addEventListenerCleanup(btn, 'contextmenu', onContextMenu);

    function onPointerDown(e) {
        startTime = Date.now();
        hasMoved = false;
        pointerId = e.pointerId;
        const rect = btn.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        startX = e.clientX;
        startY = e.clientY;
        btn.setPointerCapture(e.pointerId);
        $toggle.addClass('dragging');
        e.preventDefault();
    }

    function onPointerMove(e) {
        if (e.pointerId !== pointerId) return;
        if (Math.abs(e.clientX - startX) > DRAG_THRESHOLD || Math.abs(e.clientY - startY) > DRAG_THRESHOLD) {
            hasMoved = true;
        }
        if (!hasMoved) return;
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        const constrained = constrainPosition(newX, newY, btn.offsetWidth, btn.offsetHeight);
        btn.style.left = constrained.x + 'px';
        btn.style.top = constrained.y + 'px';
        e.preventDefault();
    }

    function onPointerUp(e) {
        if (e.pointerId !== pointerId) return;
        try { btn.releasePointerCapture(e.pointerId); } catch (err) {}
        $toggle.removeClass('dragging');
        if (hasMoved) {
            saveSetting('phoneToggleX', parseInt(btn.style.left));
            saveSetting('phoneToggleY', parseInt(btn.style.top));
        }
        if (!hasMoved && Date.now() - startTime < 300) {
            togglePhone();
        }
        hasMoved = false;
        pointerId = null;
    }

    btn.addEventListener('pointerdown', onPointerDown);
    btn.addEventListener('pointermove', onPointerMove);
    btn.addEventListener('pointerup', onPointerUp);
    btn.addEventListener('pointercancel', onPointerUp);
    addEventListenerCleanup(btn, 'pointerdown', onPointerDown);
    addEventListenerCleanup(btn, 'pointermove', onPointerMove);
    addEventListenerCleanup(btn, 'pointerup', onPointerUp);
    addEventListenerCleanup(btn, 'pointercancel', onPointerUp);
}

// ===== 事件监听 =====

function setupMutationObserver() {
    try {
        const chatContainer = document.getElementById('chat');
        if (!chatContainer) {
            setTimeout(setupMutationObserver, 1000);
            return;
        }
        
        let addDebounceTimer = null;
        let removeDebounceTimer = null;
        
        const callbacks = createCallbacks();
        
        const observer = new MutationObserver((mutations) => {
            let hasAdded = false;
            let hasRemoved = false;
            
            for (const m of mutations) {
                if (m.addedNodes.length > 0) {
                    for (const node of m.addedNodes) {
                        if (node.nodeType === 1 && (node.classList?.contains('mes') || node.querySelector?.('.mes'))) {
                            hasAdded = true;
                            break;
                        }
                    }
                }
                if (m.removedNodes.length > 0) {
                    for (const node of m.removedNodes) {
                        if (node.nodeType === 1 && (node.classList?.contains('mes') || node.querySelector?.('.mes'))) {
                            hasRemoved = true;
                            break;
                        }
                    }
                }
                if (hasAdded && hasRemoved) break;
            }
            
            if (hasAdded) {
                if (addDebounceTimer) clearTimeout(addDebounceTimer);
                addDebounceTimer = setTimeout(() => checkLatestUserMessage(callbacks), 500);
            }
            if (hasRemoved) {
                if (removeDebounceTimer) clearTimeout(removeDebounceTimer);
                removeDebounceTimer = setTimeout(() => validateCapturedPlots(callbacks), 300);
            }
        });
        
        observer.observe(chatContainer, { childList: true, subtree: true });
        
        // 保存 observer 引用以便清理
        setMutationObserver(observer);
    } catch (e) {
        console.error('[玉子市场] DOM监听失败:', e);
    }
}

function createCallbacks() {
    return {
        onUpdate: updateCurrentContent,
        onHistoryUpdate: updateHistoryList,
        onNewItem: () => {
            showDeraToast('newItem');
            if (!$('#tamako-market-window').hasClass('visible')) {
                $('#tamako-market-toggle').addClass('has-new');
                setTimeout(() => $('#tamako-market-toggle').removeClass('has-new'), 3000);
            }
        }
    };
}

let initialScanDone = false;
let chatChangeScanTimer = null;

function doScanAndUpdate() {
    const callbacks = createCallbacks();
    scanAllMessages(callbacks);
    
    const plots = getCapturedPlots();
    if (plots.length > 0) {
        const latest = plots[plots.length - 1];
        updateCurrentContent(latest.content, latest.rawMessage);
    }
    updateHistoryList();
    
    initialScanDone = true;
}

function initEventListeners() {
    try {
        const context = SillyTavern.getContext();
        const callbacks = createCallbacks();
        
        if (context?.eventSource) {
            const registerEventSourceListener = (eventName, handler) => {
                try {
                    context.eventSource.on(eventName, handler);
                    addEventSourceListenerCleanup(context.eventSource, eventName, handler);
                } catch (e) {}
            };

            const chatChangedEvents = [...new Set(['chat_changed', 'chatchanged', 'CHAT_CHANGED'])];
            let lastChatChangeAt = 0;
            const onChatChanged = () => {
                const now = Date.now();
                if (now - lastChatChangeAt < 250) return;
                lastChatChangeAt = now;

                setCapturedPlots([]);
                if (chatChangeScanTimer) clearTimeout(chatChangeScanTimer);
                chatChangeScanTimer = setTimeout(() => {
                    doScanAndUpdate();
                    chatChangeScanTimer = null;
                }, 800);
            };

            for (const eventName of chatChangedEvents) {
                registerEventSourceListener(eventName, onChatChanged);
            }

            registerEventSourceListener('message_sent', (idx) => {
                setTimeout(() => handleUserMessage(idx, callbacks), 300);
            });

            registerEventSourceListener('message_rendered', (idx) => {
                if (SillyTavern.getContext()?.chat?.[idx]?.is_user) {
                    setTimeout(() => handleUserMessage(idx, callbacks), 200);
                }
            });

            registerEventSourceListener('generation_started', () => {
                setTimeout(() => checkLatestUserMessage(callbacks), 300);
            });

            registerEventSourceListener('generation_ended', () => {
                setTimeout(() => checkLatestUserMessage(callbacks), 300);
            });

            const deleteEvents = ['message_deleted', 'message_removed', 'chat_updated', 'message_edited', 'message_swiped'];
            for (const eventName of deleteEvents) {
                registerEventSourceListener(eventName, () => validateCapturedPlots(callbacks));
            }
        }
        
        setupMutationObserver();
        
        setTimeout(() => {
            if (!initialScanDone) {
                const ctx = SillyTavern.getContext();
                if (ctx?.chat?.length > 0) {
                    doScanAndUpdate();
                }
            }
        }, 2000);
        
    } catch (e) {
        console.error('[玉子市场] 事件监听失败:', e);
        setupMutationObserver();
    }
}

// ===== 初始化 =====

(function init() {
    const onReady = () => {
        try {
            const settings = getSettings();
            setExtensionEnabled(settings.enabled !== false);
            setPhoneEnabled(settings.phoneEnabled !== false);

            createWindow();
            createToggleButton();
            createPhoneContainer();
            createPhoneToggleButton();
            setTimeout(createSettingsPanel, 2000);
            initEventListeners();

            // 根据设置显示/隐藏
            if (settings.enabled === false) {
                $('#tamako-market-toggle').hide();
            }
            if (settings.phoneEnabled === false) {
                $('#tamako-phone-toggle').hide();
            }
            
            console.log('[玉子市场] v2.9.0');
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

// ===== 扩展销毁函数 =====
// 用于清理资源，防止内存泄漏
// 可在扩展卸载或页面切换时调用

export function destroy() {
    try {
        // 断开 MutationObserver
        disconnectObserver();
        
        // 清除所有事件监听器
        clearAllEventListeners();
        clearAllEventSourceListeners();

        if (chatChangeScanTimer) {
            clearTimeout(chatChangeScanTimer);
            chatChangeScanTimer = null;
        }
        
        // 移除 DOM 元素
        const $window = $('#tamako-market-window');
        const $toggle = $('#tamako-market-toggle');
        const $phoneContainer = $('#tamako-phone-standalone');
        const $phoneToggle = $('#tamako-phone-toggle');
        
        // 释放 iframe 的 blob URL
        const iframe = $window.find('.tamako-beautifier-frame')[0];
        if (iframe && iframe._blobUrl) {
            URL.revokeObjectURL(iframe._blobUrl);
            iframe._blobUrl = null;
        }
        
        $window.remove();
        $toggle.remove();
        $phoneContainer.remove();
        $phoneToggle.remove();
        $('#tamako-market-settings').remove();
        
        // 清除定时器
        import('./modules/state.js').then(state => {
            if (state.validateDebounceTimer) {
                clearTimeout(state.validateDebounceTimer);
            }
            if (state.beautifierLoadTimeout) {
                clearTimeout(state.beautifierLoadTimeout);
            }
        });
        
        console.log('[玉子市场] 扩展已卸载');
    } catch (e) {
        console.error('[玉子市场] 卸载错误:', e);
    }
}
