import { MAX_TEMPLATES } from './constants.js';
import { getCapturedPlots } from './state.js';
import { showDeraToast } from './utils.js';
import { getSettings, generateTemplateId, updateBeautifierSettings } from './settings.js';
import { clearTemplateCache, parseBeautifierTemplate, validateTemplate, renderWithBeautifier, getActiveTemplateData } from './beautifier.js';
import { toggleWindow, updateCurrentContent } from './window.js';
import {
    isValidTemplateExtension,
    createTemplateRecord,
    resolveTemplateSelection,
    resolveTemplateDeletion,
    resolveTemplateRename,
} from './settings-template-core.js';

export function bindBeautifierEvents() {
    const $fileDrop = $('#tamako-file-drop');
    const $fileInput = $('#tamako-file-input');
    const $fileStatus = $('#tamako-file-status');

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
            this.value = '';
        }
    });

    $('#tamako-beautifier-enabled').on('change', function() {
        updateBeautifierSettings(beautifier => {
            beautifier.enabled = this.checked;
        });
        clearTemplateCache();

        refreshCurrentContent();
        $fileStatus.removeClass('error success').text(this.checked ? '已启用美化器' : '已禁用美化器');
    });

    $('#tamako-template-select').on('change', function() {
        const templateId = this.value;
        switchTemplate(templateId);
    });

    $('#tamako-beautifier-test').on('click', handleTestTemplate);

    $('#tamako-beautifier-clear-all').on('click', function() {
        if (!confirm('确定要删除所有模板吗？')) return;

        updateBeautifierSettings(beautifier => {
            beautifier.templates = [];
            beautifier.activeTemplateId = null;
        });
        clearTemplateCache();

        updateTemplateUI();
        refreshCurrentContent();
        $fileStatus.removeClass('error').addClass('success').text('已清空所有模板');
    });
}

function handleFileUpload(file) {
    const $fileStatus = $('#tamako-file-status');

    if (!file) return;

    const settings = getSettings();
    if (settings.beautifier.templates.length >= MAX_TEMPLATES) {
        $fileStatus.removeClass('success').addClass('error').text(`最多只能保存${MAX_TEMPLATES}个模板`);
        return;
    }

    if (!isValidTemplateExtension(file.name)) {
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

        const newTemplate = createTemplateRecord({
            id: generateTemplateId(),
            fileName: file.name,
            template: content,
            createdAt: Date.now(),
        });

        updateBeautifierSettings(beautifier => {
            beautifier.templates.push(newTemplate);
            beautifier.activeTemplateId = newTemplate.id;
        });

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
    const settings = getSettings();
    const selection = resolveTemplateSelection(settings.beautifier.templates, templateId);

    updateBeautifierSettings(beautifier => {
        beautifier.activeTemplateId = selection.activeTemplateId;
    });

    clearTemplateCache();
    updateTemplateUI();
    refreshCurrentContent();

    if (selection.template) {
        showDeraToast('templateSwitch');
        $fileStatus.removeClass('error').addClass('success').text(`已切换到: ${selection.template.name}`);
    } else {
        $fileStatus.removeClass('error success').text('已取消选择模板');
    }
}

function deleteTemplate(templateId) {
    const $fileStatus = $('#tamako-file-status');
    const settings = getSettings();
    const deletion = resolveTemplateDeletion(
        settings.beautifier.templates,
        settings.beautifier.activeTemplateId,
        templateId,
    );
    if (!deletion.deletedTemplate) return;

    const deletedName = deletion.deletedTemplate.name;
    updateBeautifierSettings(beautifier => {
        beautifier.templates = deletion.templates;
        beautifier.activeTemplateId = deletion.activeTemplateId;
    });
    clearTemplateCache();
    updateTemplateUI();
    refreshCurrentContent();

    showDeraToast('templateDeleted');
    $fileStatus.removeClass('error').addClass('success').text(`已删除: ${deletedName}`);
}

function renameTemplate(templateId, newName) {
    const settings = getSettings();
    const renameResult = resolveTemplateRename(settings.beautifier.templates, templateId, newName);
    if (!renameResult.renamed) return;

    updateBeautifierSettings(beautifier => {
        beautifier.templates = renameResult.templates;
    });
    updateTemplateUI();
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

export function updateTemplateUI() {
    const settings = getSettings();
    const templates = settings.beautifier?.templates || [];
    const activeId = settings.beautifier?.activeTemplateId;

    const $select = $('#tamako-template-select');
    $select.empty();
    $select.append('<option value="">-- 选择模板 --</option>');

    templates.forEach(t => {
        const selected = t.id === activeId ? 'selected' : '';
        $select.append(`<option value="${t.id}" ${selected}>${escapeHtml(t.name)}</option>`);
    });

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
