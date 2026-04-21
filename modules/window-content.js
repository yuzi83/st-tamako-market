// modules/window-content.js
/**
 * 玉子市场 - 当前内容渲染
 * @version 2.8.6
 *
 * 负责：空态、美化器渲染、纯文本回退与内容区资源释放
 */

import { ICONS } from './constants.js';
import { getSearchQuery } from './state.js';
import { getSettings } from './settings.js';
import { getDeraMessage, highlightText } from './utils.js';
import { renderWithBeautifier, getActiveTemplateData } from './beautifier.js';

function releaseBeautifierResources($content) {
    const $iframe = $content.find('.tamako-beautifier-frame');
    if ($iframe.length && $iframe[0]._blobUrl) {
        URL.revokeObjectURL($iframe[0]._blobUrl);
        $iframe[0]._blobUrl = null;
    }
}

function renderEmptyState($content) {
    releaseBeautifierResources($content);
    $content.css('position', '').empty().html(`
        <div class="tamako-empty">
            <span class="icon">${ICONS.sparkle}</span>
            <span class="message">${getDeraMessage('empty')}</span>
        </div>
    `);
}

function renderPlainText($content, content, searchQuery) {
    $content.css('position', '');
    releaseBeautifierResources($content);
    $content.find('.tamako-beautifier-frame, .tamako-beautifier-loading').remove();

    let formatted = content
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>');

    if (searchQuery) {
        formatted = highlightText(formatted, searchQuery);
    }

    $content.html(`<div class="tamako-plot-content"><div>${formatted.replace(/\n/g, '<br>')}</div></div>`);
}

export function updateCurrentContent(content, rawMessage) {
    const $content = $('#tamako-market-window .tamako-content[data-content="current"]');
    const settings = getSettings();
    const searchQuery = getSearchQuery();

    if (!content?.trim()) {
        renderEmptyState($content);
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

    renderPlainText($content, content, searchQuery);
}
