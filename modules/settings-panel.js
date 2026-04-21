// modules/settings-panel.js
/**
 * 玉子市场 - 设置面板
 * @version 2.8.5
 */

import { ICONS, MAX_TEMPLATES } from './constants.js';
import { getCapturedPlots, extensionEnabled, setExtensionEnabled } from './state.js';
import { getSettings, saveSetting } from './settings.js';
import { toggleWindow, resetWindowPosition, resetTogglePosition } from './window.js';
import { bindBeautifierEvents, updateTemplateUI } from './settings-templates.js';

// ===== 设置面板创建 =====

export function createSettingsPanel() {
    if (document.getElementById('tamako-market-settings')) return;
    const container = document.getElementById('extensions_settings');
    if (!container) return;

    const settings = getSettings();
    const isEnabled = settings.enabled !== false;
    
    const html = `
        <div id="tamako-market-settings" class="extension_settings">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>玉子市场</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div>
                </div>
                <div class="inline-drawer-content" style="display: none;">
                    <div style="padding: 10px;">
                        <label class="checkbox_label">
                            <input type="checkbox" id="tamako-enabled" ${isEnabled ? 'checked' : ''}>
                            <span>启用扩展</span>
                        </label>
                        <label class="checkbox_label">
                            <input type="checkbox" id="tamako-auto-capture" ${settings.autoCapture ? 'checked' : ''}>
                            <span>自动捕获</span>
                        </label>
                        
                        <div style="margin: 10px 0;">
                            <label style="display: block; margin-bottom: 4px; font-size: 12px;">捕获标签</label>
                            <input type="text" id="tamako-capture-tags" class="text_pole" value="${(settings.captureTags || []).join(', ')}" placeholder="recall, scene_direction">
                        </div>
                        
                        <div class="tamako-settings-section">
                            <div class="tamako-number-row">
                                <label>扫描消息数</label>
                                <input type="number" id="tamako-max-scan" class="text_pole" value="${settings.maxScanMessages}" min="10" max="500" step="10">
                                <span class="hint">条</span>
                            </div>
                            <div class="tamako-number-row">
                                <label>最大存储数</label>
                                <input type="number" id="tamako-max-store" class="text_pole" value="${settings.maxStoredPlots}" min="10" max="200" step="10">
                                <span class="hint">条</span>
                            </div>
                        </div>
                        
                        <div class="tamako-settings-section">
                            <div class="tamako-settings-section-title">🎨 今日特选美化器</div>
                            <label class="checkbox_label">
                                <input type="checkbox" id="tamako-beautifier-enabled" ${settings.beautifier?.enabled ? 'checked' : ''}>
                                <span>启用美化器</span>
                            </label>
                            
                            <!-- 模板选择器 -->
                            <div class="tamako-template-selector">
                                <label style="display: block; margin: 8px 0 4px; font-size: 12px;">当前模板</label>
                                <select id="tamako-template-select" class="text_pole">
                                    <option value="">-- 选择模板 --</option>
                                </select>
                            </div>
                            
                            <!-- 模板列表 -->
                            <div id="tamako-template-list" class="tamako-template-list"></div>
                            
                            <!-- 上传区域 -->
                            <div class="tamako-file-drop" id="tamako-file-drop">
                                <div class="tamako-file-drop-text">点击上传或拖拽文件添加模板<br>支持 .html / .json / .txt（最多${MAX_TEMPLATES}个）</div>
                            </div>
                            <input type="file" class="tamako-file-input" id="tamako-file-input" accept=".html,.json,.txt,.htm">
                            
                            <div class="tamako-file-status" id="tamako-file-status"></div>
                            
                            <div class="tamako-btn-group">
                                <button id="tamako-beautifier-test" class="menu_button">测试当前</button>
                                <button id="tamako-beautifier-clear-all" class="menu_button">清空全部</button>
                            </div>
                        </div>
                        
                        <div class="tamako-btn-group">
                            <button id="tamako-open-btn" class="menu_button">打开窗口</button>
                            <button id="tamako-reset-btn" class="menu_button">重置窗口</button>
                            <button id="tamako-reset-toggle-btn" class="menu_button">重置按钮</button>
                        </div>
                        
                        <div class="tamako-stats">已捕获: <span id="tamako-count">0</span> 条记录</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', html);
    
    bindDrawerEvents();
    bindBasicSettingsEvents();
    bindBeautifierEvents();
    bindButtonEvents();
    updateTemplateUI();
    
    setExtensionEnabled(isEnabled);

    if (!isEnabled) {
        $('#tamako-market-toggle').hide();
        $('#tamako-market-window').removeClass('visible');
    } else {
        $('#tamako-market-toggle').show();
    }
}

// ===== 抽屉开关事件 =====

function bindDrawerEvents() {
    const $drawer = $('#tamako-market-settings .inline-drawer');
    const $header = $drawer.find('.inline-drawer-header');
    const $content = $drawer.find('.inline-drawer-content');
    const $icon = $drawer.find('.inline-drawer-icon');
    
    $header.off('click').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = $content.is(':visible');
        if (isOpen) {
            $content.slideUp(200);
            $icon.removeClass('fa-circle-chevron-up').addClass('fa-circle-chevron-down');
        } else {
            $content.slideDown(200);
            $icon.removeClass('fa-circle-chevron-down').addClass('fa-circle-chevron-up');
        }
    });
}

// ===== 基本设置事件 =====

function bindBasicSettingsEvents() {
    $('#tamako-enabled').on('change', function() {
        setExtensionEnabledWithUI(this.checked);
    });
    
    $('#tamako-auto-capture').on('change', function() {
        saveSetting('autoCapture', this.checked);
    });
    
    let tagsTimeout = null;
    $('#tamako-capture-tags').on('input', function() {
        clearTimeout(tagsTimeout);
        tagsTimeout = setTimeout(() => {
            const tags = this.value.split(',').map(t => t.trim()).filter(t => t);
            saveSetting('captureTags', tags);
        }, 500);
    });
    
    $('#tamako-max-scan').on('change', function() {
        this.value = Math.max(10, Math.min(500, parseInt(this.value) || 50));
        saveSetting('maxScanMessages', parseInt(this.value));
    });
    
    $('#tamako-max-store').on('change', function() {
        this.value = Math.max(10, Math.min(200, parseInt(this.value) || 50));
        saveSetting('maxStoredPlots', parseInt(this.value));
    });
}

function setExtensionEnabledWithUI(enabled) {
    setExtensionEnabled(enabled);
    saveSetting('enabled', enabled);
    
    const $button = $('#tamako-market-toggle');
    if (enabled) {
        $button.show();
    } else {
        $button.hide();
        $('#tamako-market-window').removeClass('visible');
    }
}


function bindButtonEvents() {
    $('#tamako-open-btn').on('click', () => {
        if (!extensionEnabled) {
            setExtensionEnabledWithUI(true);
            $('#tamako-enabled').prop('checked', true);
        }
        toggleWindow(true);
    });
    
    $('#tamako-reset-btn').on('click', () => resetWindowPosition());
    $('#tamako-reset-toggle-btn').on('click', () => resetTogglePosition());
}

export function updateCaptureCount() {
    const capturedPlots = getCapturedPlots();
    $('#tamako-count').text(capturedPlots.length);
    $('#tamako-history-count').text(capturedPlots.length);
}

