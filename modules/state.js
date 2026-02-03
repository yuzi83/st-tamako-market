// modules/state.js
/**
 * 玉子市场 - 状态管理
 * @version 2.6.0
 */

// 全局状态
export let capturedPlots = [];
export let deleteMode = false;
export let extensionEnabled = true;
export let searchQuery = '';
export let currentTheme = 'tamako';
export let isThemeEditorOpen = false;
export let isEyedropperActive = false;
export let currentEditingColor = null;
export let tempCustomTheme = null;

// 模板缓存
export let cachedTemplate = null;
export let cachedTemplateSource = '';
export let cachedTemplateId = null;  // 新增：缓存的模板ID

// 定时器
export let validateDebounceTimer = null;
export let beautifierLoadTimeout = null;

// 拖拽状态
export let resizeState = {
    isResizing: false,
    handle: '',
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    element: null,
    pointerId: null
};

export let dragState = {
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
    pointerId: null
};

// 调色盘状态
export let pickerState = {
    colorKey: null,
    hue: 0,
    saturation: 100,
    lightness: 50
};

// ===== Getter 函数 =====
export function getCapturedPlots() {
    return capturedPlots;
}

export function getDeleteMode() {
    return deleteMode;
}

export function getSearchQuery() {
    return searchQuery;
}

export function getCachedTemplateId() {
    return cachedTemplateId;
}

// ===== 状态更新函数 =====
export function setCapturedPlots(plots) {
    capturedPlots = plots;
}

export function setDeleteMode(mode) {
    deleteMode = mode;
}

export function setExtensionEnabled(enabled) {
    extensionEnabled = enabled;
}

export function setSearchQuery(query) {
    searchQuery = query;
}

export function setCurrentTheme(theme) {
    currentTheme = theme;
}

export function setThemeEditorOpen(open) {
    isThemeEditorOpen = open;
}

export function setEyedropperActive(active) {
    isEyedropperActive = active;
}

export function setCurrentEditingColor(color) {
    currentEditingColor = color;
}

export function setTempCustomTheme(theme) {
    tempCustomTheme = theme;
}

export function setCachedTemplate(template, source, templateId = null) {
    cachedTemplate = template;
    cachedTemplateSource = source;
    cachedTemplateId = templateId;
}

export function clearTemplateCache() {
    cachedTemplate = null;
    cachedTemplateSource = '';
    cachedTemplateId = null;
}

export function setValidateDebounceTimer(timer) {
    validateDebounceTimer = timer;
}

export function setBeautifierLoadTimeout(timeout) {
    beautifierLoadTimeout = timeout;
}

export function updateResizeState(updates) {
    Object.assign(resizeState, updates);
}

export function updateDragState(updates) {
    Object.assign(dragState, updates);
}

export function updatePickerState(updates) {
    Object.assign(pickerState, updates);
}

export function resetResizeState() {
    resizeState = {
        isResizing: false,
        handle: '',
        startX: 0,
        startY: 0,
        startWidth: 0,
        startHeight: 0,
        element: null,
        pointerId: null
    };
}

export function resetDragState() {
    dragState = {
        isDragging: false,
        offsetX: 0,
        offsetY: 0,
        pointerId: null
    };
}
