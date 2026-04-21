// modules/window-history.js
/**
 * 玉子市场 - 历史列表与删除模式
 * @version 2.8.6
 *
 * 负责：历史列表渲染、搜索过滤、删除模式与计数同步
 */

import { ICONS } from './constants.js';
import {
    getCapturedPlots,
    getDeleteMode,
    getSearchQuery,
    setCapturedPlots,
    setDeleteMode,
} from './state.js';
import { getDeraMessage, highlightText, extractAMCodes, formatAMCodes, showDeraToast } from './utils.js';
import { filterPlots } from './capture.js';
import { updateCurrentContent } from './window-content.js';

export function updateCaptureCount() {
    const capturedPlots = getCapturedPlots();
    $('#tamako-count').text(capturedPlots.length);
    $('#tamako-history-count').text(capturedPlots.length);
}

export function toggleDeleteMode(enable) {
    const $window = $('#tamako-market-window');
    const currentDeleteMode = getDeleteMode();
    const nextMode = enable ?? !currentDeleteMode;

    setDeleteMode(nextMode);

    $window.find('.tamako-delete-bar').toggle(nextMode);
    $window.find('.tamako-btn.delete-mode').toggleClass('active', nextMode);
    $window.find('#tamako-select-all').prop('checked', false);

    if (nextMode) {
        $window.find('.tamako-tab[data-tab="history"]').click();
    }

    updateHistoryList();
}

export function deleteSelectedItems() {
    const selectedIndexes = [];
    $('.tamako-history-item .tamako-checkbox:checked').each(function() {
        selectedIndexes.push(parseInt($(this).closest('.tamako-history-item').data('index'), 10));
    });

    if (selectedIndexes.length === 0) {
        return;
    }

    const capturedPlots = getCapturedPlots();
    const nextPlots = [...capturedPlots];
    selectedIndexes
        .sort((left, right) => right - left)
        .forEach(index => nextPlots.splice(index, 1));

    setCapturedPlots(nextPlots);

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
    for (let index = filteredPlots.length - 1; index >= 0; index--) {
        const plot = filteredPlots[index];
        const originalIndex = capturedPlots.indexOf(plot);
        const amDisplay = formatAMCodes(extractAMCodes(plot.content));
        const checkbox = deleteMode
            ? `<input type="checkbox" class="tamako-checkbox" onclick="event.stopPropagation()">`
            : '';
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
