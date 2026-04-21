// index.js
/**
 * 玉子市场 - SillyTavern 悬浮窗扩展
 * @version 2.8.6
 *
 * 更新日志:
 * - v2.8.6: 规范化事件监听系统，使用 EventListenerManager 统一管理
 * - v2.8.6: 添加 JSDoc 类型注释，提高代码可维护性
 * - v2.8.6: 优化事件清理机制，防止内存泄漏
 */

import { setExtensionEnabled, cleanupAllResources } from './modules/state.js';
import { showDeraToast } from './modules/utils.js';
import { getSettings } from './modules/settings.js';
import { createWindow, updateCurrentContent, updateHistoryList } from './modules/window.js';
import { createSettingsPanel } from './modules/settings-panel.js';
import { createToggleButton, removeToggleButton } from './modules/toggle.js';
import { createRuntimeController } from './modules/runtime.js';

// ===== 运行时编排 =====

let runtimeController = null;
let settingsPanelTimer = null;

function scheduleSettingsPanelCreation() {
    if (settingsPanelTimer) {
        clearTimeout(settingsPanelTimer);
    }

    settingsPanelTimer = setTimeout(() => {
        settingsPanelTimer = null;
        createSettingsPanel();
    }, 2000);
}

function createRuntimeCallbacks() {
    return {
        onUpdate: updateCurrentContent,
        onHistoryUpdate: updateHistoryList,
        onNewItem: () => {
            showDeraToast('newItem');
            if (!$('#tamako-market-window').hasClass('visible')) {
                $('#tamako-market-toggle').addClass('has-new');
                setTimeout(() => $('#tamako-market-toggle').removeClass('has-new'), 3000);
            }
        },
    };
}

// ===== 初始化 =====

(function init() {
    const onReady = () => {
        try {
            const settings = getSettings();
            setExtensionEnabled(settings.enabled !== false);

            createWindow();
            createToggleButton();
            scheduleSettingsPanelCreation();

            if (!runtimeController) {
                runtimeController = createRuntimeController(createRuntimeCallbacks());
            }
            runtimeController.start();
            
            console.log('[玉子市场] v2.8.6 - 事件系统优化版');
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
/**
 * 清理所有资源，防止内存泄漏
 * 可在扩展卸载或页面切换时调用
 */
export function destroy() {
    try {
        console.log('[玉子市场] 开始清理资源...');
        
        if (settingsPanelTimer) {
            clearTimeout(settingsPanelTimer);
            settingsPanelTimer = null;
        }

        if (runtimeController) {
            runtimeController.destroy();
            runtimeController = null;
        } else {
            cleanupAllResources();
        }
        
        // 移除 DOM 元素
        const $window = $('#tamako-market-window');
        
        // 释放 iframe 的 blob URL
        const iframe = $window.find('.tamako-beautifier-frame')[0];
        if (iframe && iframe._blobUrl) {
            URL.revokeObjectURL(iframe._blobUrl);
            iframe._blobUrl = null;
        }
        
        $window.remove();
        removeToggleButton();
        $('#tamako-market-settings').remove();
        
        console.log('[玉子市场] 扩展已卸载');
    } catch (e) {
        console.error('[玉子市场] 卸载错误:', e);
    }
}
