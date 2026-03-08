// modules/settings-panel.js
/**
 * 玉子市场 - 设置面板
 * @version 2.8.5
 */

import { ICONS, MAX_TEMPLATES } from './constants.js';
import { getCapturedPlots, extensionEnabled, phoneEnabled, setExtensionEnabled, setPhoneEnabled } from './state.js';
import { getSettings, saveSetting, generateTemplateId, getActiveTemplate, showDeraToast } from './utils.js';
import { clearTemplateCache, parseBeautifierTemplate, validateTemplate, renderWithBeautifier, getActiveTemplateData } from './beautifier.js';
import { toggleWindow, togglePhone, updateCurrentContent, resetWindowPosition, resetTogglePosition, resetPhoneTogglePosition } from './window.js';

// ===== 设置面板创建 =====

export function createSettingsPanel() {
    if (document.getElementById('tamako-market-settings')) return;
    const container = document.getElementById('extensions_settings');
    if (!container) return;

    const settings = getSettings();
    const isEnabled = settings.enabled !== false;
    const isPhoneEnabled = settings.phoneEnabled !== false;
    
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
                            <input type="checkbox" id="tamako-market-enabled" ${isEnabled ? 'checked' : ''}>
                            <span>启用玉子市场</span>
                        </label>
                        <label class="checkbox_label">
                            <input type="checkbox" id="tamako-phone-enabled" ${isPhoneEnabled ? 'checked' : ''}>
                            <span>启用玉子的手机</span>
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
                            <button id="tamako-open-btn" class="menu_button">打开市场</button>
                            <button id="tamako-open-phone-btn" class="menu_button">打开手机</button>
                        </div>
                        <div class="tamako-btn-group">
                            <button id="tamako-reset-btn" class="menu_button">重置市场窗口</button>
                            <button id="tamako-reset-toggle-btn" class="menu_button">重置市场按钮</button>
                        </div>
                        <div class="tamako-btn-group">
                            <button id="tamako-reset-phone-toggle-btn" class="menu_button">重置手机按钮</button>
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
    setPhoneEnabled(isPhoneEnabled);

    if (!isEnabled) {
        $('#tamako-market-toggle').hide();
        $('#tamako-market-window').removeClass('visible');
    } else {
        $('#tamako-market-toggle').show();
    }

    if (!isPhoneEnabled) {
        $('#tamako-phone-toggle').hide();
        $('#tamako-phone-standalone').removeClass('visible');
    } else {
        $('#tamako-phone-toggle').show();
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
    $('#tamako-market-enabled').on('change', function() {
        setMarketEnabledWithUI(this.checked);
    });

    $('#tamako-phone-enabled').on('change', function() {
        setPhoneEnabledWithUI(this.checked);
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

function setMarketEnabledWithUI(enabled) {
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

function setPhoneEnabledWithUI(enabled) {
    setPhoneEnabled(enabled);
    saveSetting('phoneEnabled', enabled);
    
    const $button = $('#tamako-phone-toggle');
    if (enabled) {
        $button.show();
    } else {
        $button.hide();
        $('#tamako-phone-standalone').removeClass('visible');
    }
}

// ===== 美化器事件 =====

function bindBeautifierEvents() {
    const $fileDrop = $('#tamako-file-drop');
    const $fileInput = $('#tamako-file-input');
    const $fileStatus = $('#tamako-file-status');
    
    // 文件上传
    $fileDrop.on('click', () => $fileInput.click());
    
    $fileDrop.on('dragover', function(e) {
        e.preventDefault();
        $(this).addClass('dragover');
    });
    
    $fileDrop.on('dragleave drop', function(e) {
        e.preventDefault();
        $(this).removeClass('dragover');
    });
    
    $fileDrop.on('drop', function(e) {
        e.preventDefault();
        if (e.originalEvent.dataTransfer.files.length > 0) {
            handleFileUpload(e.originalEvent.dataTransfer.files[0]);
        }
    });
    
    $fileInput.on('change', function() {
        if (this.files.length > 0) {
            handleFileUpload(this.files[0]);
            this.value = ''; // 重置以便重复上传同一文件
        }
    });
    
    // 启用/禁用美化器
    $('#tamako-beautifier-enabled').on('change', function() {
        const s = getSettings();
        s.beautifier.enabled = this.checked;
        saveSetting('beautifier', s.beautifier);
        clearTemplateCache();
        
        refreshCurrentContent();
        $fileStatus.removeClass('error success').text(this.checked ? '已启用美化器' : '已禁用美化器');
    });
    
    // 模板选择器
    $('#tamako-template-select').on('change', function() {
        const templateId = this.value;
        switchTemplate(templateId);
    });
    
    // 测试按钮
    $('#tamako-beautifier-test').on('click', handleTestTemplate);
    
    // 清空全部
    $('#tamako-beautifier-clear-all').on('click', function() {
        if (!confirm('确定要删除所有模板吗？')) return;
        
        const s = getSettings();
        s.beautifier.templates = [];
        s.beautifier.activeTemplateId = null;
        saveSetting('beautifier', s.beautifier);
        clearTemplateCache();
        
        updateTemplateUI();
        refreshCurrentContent();
        $fileStatus.removeClass('error').addClass('success').text('已清空所有模板');
    });
}

// ===== 模板操作 =====

function handleFileUpload(file) {
    const $fileStatus = $('#tamako-file-status');
    
    if (!file) return;
    
    const settings = getSettings();
    if (settings.beautifier.templates.length >= MAX_TEMPLATES) {
        $fileStatus.removeClass('success').addClass('error').text(`最多只能保存${MAX_TEMPLATES}个模板`);
        return;
    }
    
    const validExtensions = ['.html', '.htm', '.json', '.txt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(ext)) {
        $fileStatus.removeClass('success').addClass('error').text('不支持的文件类型');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        
        const parsed = parseBeautifierTemplate(content);
        if (!parsed) {
            $fileStatus.removeClass('success').addClass('error').text('无法解析文件内容');
            return;
        }
        
        const validation = validateTemplate(parsed);
        if (!validation.valid) {
            $fileStatus.removeClass('success').addClass('error').text(validation.error);
            return;
        }
        
        // 添加新模板
        const newTemplate = {
            id: generateTemplateId(),
            name: file.name.replace(/\.[^.]+$/, ''),  // 移除扩展名
            template: content,
            createdAt: Date.now()
        };
        
        const s = getSettings();
        s.beautifier.templates.push(newTemplate);
        s.beautifier.activeTemplateId = newTemplate.id;  // 自动切换到新模板
        saveSetting('beautifier', s.beautifier);
        
        clearTemplateCache();
        updateTemplateUI();
        refreshCurrentContent();
        
        showDeraToast('templateSaved');
        $fileStatus.removeClass('error').addClass('success').text(`已添加模板: ${newTemplate.name}`);
    };
    
    reader.onerror = function() {
        $fileStatus.removeClass('success').addClass('error').text('文件读取失败');
    };
    
    reader.readAsText(file);
}

function switchTemplate(templateId) {
    const $fileStatus = $('#tamako-file-status');
    const s = getSettings();
    
    s.beautifier.activeTemplateId = templateId || null;
    saveSetting('beautifier', s.beautifier);
    
    clearTemplateCache();
    updateTemplateUI();
    refreshCurrentContent();
    
    if (templateId) {
        const template = s.beautifier.templates.find(t => t.id === templateId);
        if (template) {
            showDeraToast('templateSwitch');
            $fileStatus.removeClass('error').addClass('success').text(`已切换到: ${template.name}`);
        }
    } else {
        $fileStatus.removeClass('error success').text('已取消选择模板');
    }
}

function deleteTemplate(templateId) {
    const $fileStatus = $('#tamako-file-status');
    const s = getSettings();
    
    const idx = s.beautifier.templates.findIndex(t => t.id === templateId);
    if (idx === -1) return;
    
    const deletedName = s.beautifier.templates[idx].name;
    s.beautifier.templates.splice(idx, 1);
    
    // 如果删除的是当前激活的模板，清空激活状态
    if (s.beautifier.activeTemplateId === templateId) {
        s.beautifier.activeTemplateId = null;
    }
    
    saveSetting('beautifier', s.beautifier);
    clearTemplateCache();
    updateTemplateUI();
    refreshCurrentContent();
    
    showDeraToast('templateDeleted');
    $fileStatus.removeClass('error').addClass('success').text(`已删除: ${deletedName}`);
}

function renameTemplate(templateId, newName) {
    if (!newName || !newName.trim()) return;
    
    const s = getSettings();
    const template = s.beautifier.templates.find(t => t.id === templateId);
    if (template) {
        template.name = newName.trim();
        saveSetting('beautifier', s.beautifier);
        updateTemplateUI();
    }
}

function handleTestTemplate() {
    const $fileStatus = $('#tamako-file-status');
    const settings = getSettings();
    
    if (!settings.beautifier?.activeTemplateId) {
        $fileStatus.removeClass('success').addClass('error').text('请先选择一个模板');
        return;
    }
    
    const templateData = getActiveTemplateData();
    if (!templateData) {
        $fileStatus.removeClass('success').addClass('error').text('模板解析失败');
        return;
    }
    
    const capturedPlots = getCapturedPlots();
    const testMsg = capturedPlots.length > 0
        ? capturedPlots[capturedPlots.length - 1].rawMessage
        : getTestMessage();
    
    const $content = $('#tamako-market-window .tamako-content[data-content="current"]');
    
    if (renderWithBeautifier($content, testMsg, templateData)) {
        $fileStatus.removeClass('error').addClass('success').text('测试成功');
        toggleWindow(true);
        $('#tamako-market-window .tamako-tab[data-tab="current"]').click();
    } else {
        $fileStatus.removeClass('success').addClass('error').text('渲染失败');
    }
}

function getTestMessage() {
    return `以上是用户的本轮输入
<prologue># 第一幕：初遇
**【本幕概要】** 测试场景</prologue>
<recall>AM0001, AM0002</recall>
<scene_direction><timestamp>Day 1, 14:30 (+2小时)</timestamp>测试场景描述</scene_direction>
<content><file><review npc="测试NPC">[阿尔] "这是测试对话"
[爱德华] "这也是测试对话"</review></file></content>`;
}

function refreshCurrentContent() {
    const capturedPlots = getCapturedPlots();
    if (capturedPlots.length > 0) {
        const latest = capturedPlots[capturedPlots.length - 1];
        updateCurrentContent(latest.content, latest.rawMessage);
    } else {
        updateCurrentContent('', '');
    }
}

// ===== UI 更新 =====

function updateTemplateUI() {
    const settings = getSettings();
    const templates = settings.beautifier?.templates || [];
    const activeId = settings.beautifier?.activeTemplateId;
    
    // 更新选择器
    const $select = $('#tamako-template-select');
    $select.empty();
    $select.append('<option value="">-- 选择模板 --</option>');
    
    templates.forEach(t => {
        const selected = t.id === activeId ? 'selected' : '';
        $select.append(`<option value="${t.id}" ${selected}>${escapeHtml(t.name)}</option>`);
    });
    
    // 更新模板列表
    const $list = $('#tamako-template-list');
    $list.empty();
    
    if (templates.length === 0) {
        $list.html('<div class="tamako-template-empty">暂无模板，请上传</div>');
        return;
    }
    
    templates.forEach(t => {
        const isActive = t.id === activeId;
        const date = new Date(t.createdAt).toLocaleDateString();
        
        $list.append(`
            <div class="tamako-template-item ${isActive ? 'active' : ''}" data-id="${t.id}">
                <div class="tamako-template-info">
                    <span class="tamako-template-name" title="${escapeHtml(t.name)}">${escapeHtml(t.name)}</span>
                    <span class="tamako-template-date">${date}</span>
                </div>
                <div class="tamako-template-actions">
                    <button class="tamako-tpl-btn tamako-tpl-use" title="使用此模板" ${isActive ? 'disabled' : ''}>
                        ${isActive ? '✓' : '使用'}
                    </button>
                    <button class="tamako-tpl-btn tamako-tpl-rename" title="重命名">✏️</button>
                    <button class="tamako-tpl-btn tamako-tpl-delete" title="删除">🗑️</button>
                </div>
            </div>
        `);
    });
    
    // 绑定模板列表事件
    $list.find('.tamako-tpl-use').off('click').on('click', function(e) {
        e.stopPropagation();
        const id = $(this).closest('.tamako-template-item').data('id');
        switchTemplate(id);
    });
    
    $list.find('.tamako-tpl-rename').off('click').on('click', function(e) {
        e.stopPropagation();
        const $item = $(this).closest('.tamako-template-item');
        const id = $item.data('id');
        const currentName = $item.find('.tamako-template-name').text();
        const newName = prompt('输入新名称:', currentName);
        if (newName !== null) {
            renameTemplate(id, newName);
        }
    });
    
    $list.find('.tamako-tpl-delete').off('click').on('click', function(e) {
        e.stopPropagation();
        const id = $(this).closest('.tamako-template-item').data('id');
        if (confirm('确定删除此模板？')) {
            deleteTemplate(id);
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function bindButtonEvents() {
    $('#tamako-open-btn').on('click', () => {
        if (!extensionEnabled) {
            setMarketEnabledWithUI(true);
            $('#tamako-market-enabled').prop('checked', true);
        }
        toggleWindow(true);
    });

    $('#tamako-open-phone-btn').on('click', () => {
        if (!phoneEnabled) {
            setPhoneEnabledWithUI(true);
            $('#tamako-phone-enabled').prop('checked', true);
        }
        togglePhone(true);
    });
    
    $('#tamako-reset-btn').on('click', () => resetWindowPosition());
    $('#tamako-reset-toggle-btn').on('click', () => resetTogglePosition());
    $('#tamako-reset-phone-toggle-btn').on('click', () => resetPhoneTogglePosition());
}

export function updateCaptureCount() {
    const capturedPlots = getCapturedPlots();
    $('#tamako-count').text(capturedPlots.length);
    $('#tamako-history-count').text(capturedPlots.length);
}

