// modules/theme-editor.js
/**
 * 玉子市场 - 主题编辑器
 * @version 2.8.5
 */

import { ICONS, themes, fontOptions, BUTTON_SIZE_MIN, BUTTON_SIZE_MAX, BUTTON_SIZE_DEFAULT } from './constants.js';
import {
    isThemeEditorOpen, tempCustomTheme, currentEditingColor, pickerState,
    setThemeEditorOpen, setTempCustomTheme, setEyedropperActive, setCurrentEditingColor, updatePickerState, getDeleteMode
} from './state.js';
import {
    isMobileDevice, getCurrentThemeData, applyThemeStyles,
    showDeraToast, hexToRgb, rgbToHex, rgbToHsl, hslToRgb, parseColor, applyButtonStyles
} from './utils.js';
import { getSettings } from './settings.js';
import { applyTheme } from './theme-application.js';
import { bindButtonEditorEvents as bindThemeButtonEditorEvents, updateButtonPreview as renderButtonPreview } from './theme-button-editor.js';
import {
    initColorPicker as initThemeColorPicker,
    openColorPicker as openThemeColorPicker,
    startEyedropper as startThemeEyedropper,
} from './theme-color-tools.js';
import { createThemeEditorContent as renderThemeEditorContent } from './theme-editor-view.js';

// ===== 编辑器开关 =====

export function openThemeEditor() {
    if (isThemeEditorOpen) return;
    setThemeEditorOpen(true);
    
    const $window = $('#tamako-market-window');
    setTempCustomTheme(JSON.parse(JSON.stringify(getCurrentThemeData())));
    
    $window.find('.tamako-tabs, .tamako-content, .tamako-delete-bar').hide();
    $window.find('.tamako-theme-panel').hide();
    
    const editorHtml = renderThemeEditorContent({
        themeData: tempCustomTheme || getCurrentThemeData(),
        icons: ICONS,
        fontOptions,
        buttonSizeMin: BUTTON_SIZE_MIN,
        buttonSizeMax: BUTTON_SIZE_MAX,
        buttonSizeDefault: BUTTON_SIZE_DEFAULT,
        isMobile: isMobileDevice(),
    });
    $window.append(`<div class="tamako-editor-container">${editorHtml}</div>`);
    
    bindThemeEditorEvents($window);
    bindThemeButtonEditorEvents($window, createButtonEditorDependencies());
    initThemeColorPicker(createColorToolDependencies());
    updateFontPreview();
    updateButtonPreview();
}

export function closeThemeEditor(save = false) {
    if (!isThemeEditorOpen) return;
    setThemeEditorOpen(false);
    
    const $window = $('#tamako-market-window');
    
    if (save && tempCustomTheme) {
        applyTheme('custom', tempCustomTheme);
        showDeraToast('theme');
    } else {
        const settings = getSettings();
        if (settings.theme === 'custom' && settings.customTheme) {
            applyTheme('custom', settings.customTheme);
        } else {
            applyTheme('night');
        }
    }
    
    setTempCustomTheme(null);
    $window.find('.tamako-editor-container').remove();
    $window.find('.tamako-tabs, .tamako-content[data-content="current"]').show();
    
    if (getDeleteMode()) {
        $window.find('.tamako-delete-bar').show();
    }
}

// ===== 辅助函数 =====

function updateFontPreview() {
    const fontKey = $('#tamako-font-family').val() || 'system';
    const fontValue = fontOptions[fontKey]?.value || fontOptions.system.value;
    $('.tamako-font-preview').css('font-family', fontValue);
}

function refreshEditorColors() {
    if (!tempCustomTheme) return;
    const colors = tempCustomTheme.colors;
    
    const colorMap = {
        primary: colors.primary,
        secondary: colors.secondary,
        surface: colors.surface,
        surfaceAlt: colors.surfaceAlt,
        text: colors.text,
        textMuted: colors.textMuted
    };
    
    Object.entries(colorMap).forEach(([key, value]) => {
        $(`.tamako-color-preview[data-color-key="${key}"]`).css('background', value);
        $(`.tamako-color-hex[data-color-key="${key}"]`).val(value);
    });
}

function updateTempColor(colorKey, value) {
    if (!tempCustomTheme) return;
    if (tempCustomTheme.colors[colorKey] !== undefined) {
        tempCustomTheme.colors[colorKey] = value;
    }
}

function applyTempTheme() {
    if (!tempCustomTheme) return;
    const $window = $('#tamako-market-window');
    const $toggle = $('#tamako-market-toggle');
    
    applyThemeStyles(tempCustomTheme, $window, $toggle);
    applyButtonStyles(tempCustomTheme, $toggle);
    
    const colors = tempCustomTheme.colors;
    $window.css({
        '--tamako-primary': colors.primary,
        '--tamako-secondary': colors.secondary,
        '--tamako-bg': colors.bg || `linear-gradient(135deg, ${colors.surfaceAlt} 0%, ${colors.surface} 50%, ${colors.surfaceAlt} 100%)`,
        '--tamako-surface': colors.surface,
        '--tamako-surface-alt': colors.surfaceAlt,
        '--tamako-text': colors.text,
        '--tamako-text-muted': colors.textMuted,
        '--tamako-border': colors.border,
        '--theme-primary': colors.primary,
        '--theme-secondary': colors.secondary
    });
    
    $window.find('.tamako-header').css({
        'background': `linear-gradient(135deg, ${colors.primary}E6 0%, ${colors.secondary}E6 100%)`
    });
    
    $toggle.css({
        '--theme-primary': colors.primary,
        '--theme-secondary': colors.secondary
    });
}

function resetThemeEditor() {
    const preset = themes.night;
    
    const newTheme = {
        name: '自定义',
        basedOn: 'night',
        colors: {
            primary: preset.primary,
            secondary: preset.secondary,
            bg: preset.bg,
            surface: preset.surface,
            surfaceAlt: preset.surfaceAlt,
            text: preset.text,
            textMuted: preset.textMuted,
            border: preset.border
        },
        opacity: 100,
        fontFamily: 'system',
        buttonShape: 'bar',
        buttonSize: 1.0,
        buttonImage: null
    };
    
    setTempCustomTheme(newTheme);
    refreshEditorColors();
    
    $('#tamako-opacity').val(100).siblings('.tamako-slider-value').text('100%');
    $('#tamako-font-family').val('system');
    $('#tamako-button-shape').val('bar');
    $('#tamako-button-size').val(100).siblings('.tamako-slider-value').text('100%');
    
    $('#tamako-button-image-drop').html(`
        <div class="tamako-button-image-placeholder">
            ${ICONS.image}
            <span>点击或拖拽上传图片</span>
            <span class="tamako-hint">支持 jpg/png/gif</span>
        </div>
    `);
    $('#tamako-button-image-remove').remove();
    
    updateFontPreview();
    updateButtonPreview();
    applyTempTheme();
}

// ===== 按钮编辑器事件 =====

function createButtonEditorDependencies() {
    return {
        getTempTheme: () => tempCustomTheme,
        applyTempTheme,
        updateButtonPreview,
        icons: ICONS,
    };
}

function updateButtonPreview() {
    renderButtonPreview(createButtonEditorDependencies());
}

function createColorToolDependencies() {
    return {
        isMobileDevice,
        getPickerState: () => pickerState,
        getCurrentEditingColor: () => currentEditingColor,
        updatePickerState,
        updateTempColor,
        updateButtonPreview,
        applyTempTheme,
        setEyedropperActive,
        setCurrentEditingColor,
        hexToRgb,
        rgbToHex,
        rgbToHsl,
        hslToRgb,
        parseColor,
    };
}
 
// ===== 事件绑定 =====
 
function bindThemeEditorEvents($window) {
    $window.find('.tamako-editor-btn.save').on('click', () => closeThemeEditor(true));
    $window.find('.tamako-editor-btn.reset').on('click', resetThemeEditor);
    $window.find('.tamako-editor-btn.close').on('click', () => closeThemeEditor(false));
    
    $window.find('.tamako-color-preview, .tamako-color-hex').on('click', function(e) {
        e.stopPropagation();
        const colorKey = $(this).data('color-key');
        openThemeColorPicker(colorKey, createColorToolDependencies());
    });
    
    if (!isMobileDevice()) {
        $window.find('.tamako-eyedropper-btn').on('click', function(e) {
            e.stopPropagation();
            const colorKey = $(this).data('color-key');
            startEyedropper(colorKey);
        });
    }
    
    $window.find('.tamako-color-hex').on('input', function() {
        const colorKey = $(this).data('color-key');
        let value = $(this).val().trim();
        if (!value.startsWith('#')) value = '#' + value;
        if (/^#[A-Fa-f0-9]{6}$/.test(value)) {
            updateTempColor(colorKey, value);
            $(this).siblings('.tamako-color-preview').css('background', value);
            updateButtonPreview();
            applyTempTheme();
        }
    });
    
    $window.find('#tamako-opacity').on('input', function() {
        const value = parseInt(this.value);
        $(this).siblings('.tamako-slider-value').text(value + '%');
        if (tempCustomTheme) {
            tempCustomTheme.opacity = value;
            applyTempTheme();
        }
    });
    
    $window.find('#tamako-font-family').on('change', function() {
        if (tempCustomTheme) {
            tempCustomTheme.fontFamily = this.value;
            applyTempTheme();
            updateFontPreview();
        }
    });
}

// ===== 调色盘 =====

export function startEyedropper(colorKey) {
    startThemeEyedropper(colorKey, createColorToolDependencies());
}

