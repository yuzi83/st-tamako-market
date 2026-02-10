// modules/theme-editor.js
/**
 * 玉子市场 - 主题编辑器
 * @version 2.8.3
 */

import { ICONS, themes, fontOptions, BUTTON_SIZE_MIN, BUTTON_SIZE_MAX, BUTTON_SIZE_DEFAULT } from './constants.js';
import {
    isThemeEditorOpen, tempCustomTheme, isEyedropperActive, currentEditingColor, pickerState,
    setThemeEditorOpen, setTempCustomTheme, setEyedropperActive, setCurrentEditingColor, updatePickerState
} from './state.js';
import {
    isMobileDevice, getSettings, saveSetting, getCurrentThemeData, applyThemeStyles,
    showDeraToast, hexToRgb, rgbToHex, rgbToHsl, hslToRgb, parseColor, applyButtonStyles
} from './utils.js';

let isDraggingSL = false;

// ===== 主题应用 =====

export function applyTheme(themeName, customData = null) {
    const $window = $('#tamako-market-window');
    const $toggle = $('#tamako-market-toggle');
    
    $window.removeClass('theme-night theme-custom');
    $toggle.removeClass('theme-night theme-custom');
    
    if (themeName === 'custom' && customData) {
        import('./state.js').then(state => state.setCurrentTheme('custom'));
        $window.addClass('theme-custom');
        $toggle.addClass('theme-custom');
        applyThemeStyles(customData, $window, $toggle);
        applyButtonStyles(customData, $toggle);
        
        const colors = customData.colors;
        $window.find('.tamako-header').css({
            'background': `linear-gradient(135deg, ${colors.primary}E6 0%, ${colors.secondary}E6 100%)`
        });
        
        saveSetting('theme', 'custom');
        saveSetting('customTheme', customData);
    } else {
        import('./state.js').then(state => state.setCurrentTheme('night'));
        const preset = themes.night;
        $window.addClass('theme-night');
        $toggle.addClass('theme-night');
        
        const themeData = {
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
        applyThemeStyles(themeData, $window, $toggle);
        applyButtonStyles(themeData, $toggle);
        
        $window.find('.tamako-header').css({
            'background': `linear-gradient(135deg, ${preset.primary}E6 0%, ${preset.secondary}E6 100%)`
        });
        
        saveSetting('theme', 'night');
    }
    
    $('#tamako-theme-selector').val(themeName);
}

// ===== 编辑器内容创建 =====

function createColorPicker(colorKey, label, currentColor) {
    const id = `tamako-color-${colorKey}`;
    const isMobile = isMobileDevice();
    
    const eyedropperBtn = isMobile ? '' : `<button class="tamako-eyedropper-btn" data-color-key="${colorKey}" title="吸取颜色">${ICONS.eyedropper}</button>`;
    
    return `
        <div class="tamako-color-row">
            <label for="${id}">${label}</label>
            <div class="tamako-color-input-group">
                <div class="tamako-color-preview" data-color-key="${colorKey}" style="background: ${currentColor}"></div>
                <input type="text" id="${id}" class="tamako-color-hex" data-color-key="${colorKey}" value="${currentColor}" placeholder="#FFFFFF">
                ${eyedropperBtn}
            </div>
        </div>
    `;
}

function createThemeEditorContent() {
    const themeData = tempCustomTheme || getCurrentThemeData();
    const colors = themeData.colors;
    
    const fontOptionsHtml = Object.entries(fontOptions).map(([key, font]) =>
        `<option value="${key}" ${themeData.fontFamily === key ? 'selected' : ''}>${font.name}</option>`
    ).join('');
    
    const buttonShape = themeData.buttonShape || 'bar';
    const buttonSize = themeData.buttonSize || BUTTON_SIZE_DEFAULT;
    const hasImage = !!themeData.buttonImage;
    
    return `
        <div class="tamako-theme-editor">
            <div class="tamako-editor-header">
                <span>主题编辑器</span>
                <div class="tamako-editor-actions">
                    <button class="tamako-editor-btn save" title="保存">${ICONS.check}</button>
                    <button class="tamako-editor-btn reset" title="重置">${ICONS.reset}</button>
                    <button class="tamako-editor-btn close" title="关闭">${ICONS.close}</button>
                </div>
            </div>
            
            <div class="tamako-editor-body">
                <div class="tamako-editor-section">
                    <div class="tamako-section-title">颜色设置</div>
                    ${createColorPicker('primary', '主色', colors.primary)}
                    ${createColorPicker('secondary', '辅色', colors.secondary)}
                    ${createColorPicker('surface', '表面色', colors.surface)}
                    ${createColorPicker('surfaceAlt', '表面色2', colors.surfaceAlt)}
                    ${createColorPicker('text', '文字色', colors.text)}
                    ${createColorPicker('textMuted', '次要文字', colors.textMuted)}
                </div>
                
                <div class="tamako-editor-section">
                    <div class="tamako-section-title">样式设置</div>
                    <div class="tamako-slider-row">
                        <label>透明度</label>
                        <input type="range" id="tamako-opacity" min="50" max="100" value="${themeData.opacity}">
                        <span class="tamako-slider-value">${themeData.opacity}%</span>
                    </div>
                </div>
                
                <div class="tamako-editor-section">
                    <div class="tamako-section-title">字体</div>
                    <select id="tamako-font-family" class="tamako-editor-select">
                        ${fontOptionsHtml}
                    </select>
                    <div class="tamako-font-preview">预览：玉子市场 ABC 123</div>
                </div>
                
                <div class="tamako-editor-section">
                    <div class="tamako-section-title">按钮设置</div>
                    
                    <div class="tamako-button-shape-row">
                        <label>形状</label>
                        <select id="tamako-button-shape" class="tamako-editor-select">
                            <option value="bar" ${buttonShape === 'bar' ? 'selected' : ''}>长条形</option>
                            <option value="circle" ${buttonShape === 'circle' ? 'selected' : ''}>圆形</option>
                        </select>
                    </div>
                    
                    <div class="tamako-slider-row">
                        <label>大小</label>
                        <input type="range" id="tamako-button-size" min="${BUTTON_SIZE_MIN * 100}" max="${BUTTON_SIZE_MAX * 100}" value="${buttonSize * 100}">
                        <span class="tamako-slider-value">${Math.round(buttonSize * 100)}%</span>
                    </div>
                    
                    <div class="tamako-button-image-section">
                        <label>自定义图片</label>
                        <div class="tamako-button-image-drop" id="tamako-button-image-drop">
                            ${hasImage 
                                ? `<img src="${themeData.buttonImage}" class="tamako-button-image-preview" alt="预览">`
                                : `<div class="tamako-button-image-placeholder">
                                    ${ICONS.image}
                                    <span>点击或拖拽上传图片</span>
                                    <span class="tamako-hint">支持 jpg/png/gif</span>
                                  </div>`
                            }
                        </div>
                        <input type="file" id="tamako-button-image-input" accept="image/jpeg,image/png,image/gif" style="display:none">
                        ${hasImage ? '<button id="tamako-button-image-remove" class="tamako-btn-remove-image">移除图片</button>' : ''}
                    </div>
                    
                    <div class="tamako-button-preview-container">
                        <label>预览</label>
                        <div class="tamako-button-live-preview" id="tamako-button-live-preview"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="tamako-color-picker-popup" class="tamako-color-picker-popup" style="display: none;">
            <div class="tamako-picker-header">
                <span>选择颜色</span>
                <button class="tamako-picker-close">${ICONS.close}</button>
            </div>
            <div class="tamako-picker-body">
                <div class="tamako-hue-slider">
                    <input type="range" id="tamako-hue" min="0" max="360" value="0">
                </div>
                <div class="tamako-saturation-lightness">
                    <canvas id="tamako-sl-canvas" width="200" height="150"></canvas>
                    <div class="tamako-sl-cursor"></div>
                </div>
                <div class="tamako-picker-preview">
                    <div class="tamako-preview-color"></div>
                    <input type="text" class="tamako-preview-hex" value="#FFFFFF">
                </div>
                <div class="tamako-picker-actions">
                    ${isMobileDevice() ? '' : `<button class="tamako-picker-eyedropper">${ICONS.eyedropper} 吸取</button>`}
                    <button class="tamako-picker-confirm">确定</button>
                </div>
            </div>
        </div>
    `;
}

// ===== 编辑器开关 =====

export function openThemeEditor() {
    if (isThemeEditorOpen) return;
    setThemeEditorOpen(true);
    
    const $window = $('#tamako-market-window');
    setTempCustomTheme(JSON.parse(JSON.stringify(getCurrentThemeData())));
    
    $window.find('.tamako-tabs, .tamako-content, .tamako-delete-bar').hide();
    $window.find('.tamako-theme-panel').hide();
    
    const editorHtml = createThemeEditorContent();
    $window.append(`<div class="tamako-editor-container">${editorHtml}</div>`);
    
    bindThemeEditorEvents($window);
    bindButtonEditorEvents($window);
    initColorPicker();
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
    
    import('./state.js').then(state => {
        if (state.deleteMode) {
            $window.find('.tamako-delete-bar').show();
        }
    });
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

function bindButtonEditorEvents($window) {
    $window.find('#tamako-button-shape').on('change', function() {
        if (tempCustomTheme) {
            tempCustomTheme.buttonShape = this.value;
            updateButtonPreview();
            applyTempTheme();
        }
    });
    
    $window.find('#tamako-button-size').on('input', function() {
        const value = parseInt(this.value) / 100;
        $(this).siblings('.tamako-slider-value').text(Math.round(value * 100) + '%');
        if (tempCustomTheme) {
            tempCustomTheme.buttonSize = value;
            updateButtonPreview();
            applyTempTheme();
        }
    });
    
    const $imageDrop = $window.find('#tamako-button-image-drop');
    const $imageInput = $window.find('#tamako-button-image-input');
    
    $imageDrop.on('click', () => $imageInput.click());
    
    $imageDrop.on('dragover', function(e) {
        e.preventDefault();
        $(this).addClass('dragover');
    });
    
    $imageDrop.on('dragleave drop', function(e) {
        e.preventDefault();
        $(this).removeClass('dragover');
    });
    
    $imageDrop.on('drop', function(e) {
        e.preventDefault();
        const files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
            handleButtonImageUpload(files[0]);
        }
    });
    
    $imageInput.on('change', function() {
        if (this.files.length > 0) {
            handleButtonImageUpload(this.files[0]);
            this.value = '';
        }
    });
    
    $window.on('click', '#tamako-button-image-remove', function() {
        if (tempCustomTheme) {
            tempCustomTheme.buttonImage = null;
            
            $('#tamako-button-image-drop').html(`
                <div class="tamako-button-image-placeholder">
                    ${ICONS.image}
                    <span>点击或拖拽上传图片</span>
                    <span class="tamako-hint">支持 jpg/png/gif</span>
                </div>
            `);
            $(this).remove();
            
            updateButtonPreview();
            applyTempTheme();
        }
    });
}

function handleButtonImageUpload(file) {
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        alert('请上传 jpg、png 或 gif 格式的图片');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const base64 = e.target.result;
        
        if (tempCustomTheme) {
            tempCustomTheme.buttonImage = base64;
            
            $('#tamako-button-image-drop').html(
                `<img src="${base64}" class="tamako-button-image-preview" alt="预览">`
            );
            
            if (!$('#tamako-button-image-remove').length) {
                $('#tamako-button-image-drop').after(
                    '<button id="tamako-button-image-remove" class="tamako-btn-remove-image">移除图片</button>'
                );
            }
            
            updateButtonPreview();
            applyTempTheme();
        }
    };
    
    reader.onerror = function() {
        alert('图片读取失败，请重试');
    };
    
    reader.readAsDataURL(file);
}

function updateButtonPreview() {
    if (!tempCustomTheme) return;
    
    const $preview = $('#tamako-button-live-preview');
    const shape = tempCustomTheme.buttonShape || 'bar';
    const size = tempCustomTheme.buttonSize || 1.0;
    const image = tempCustomTheme.buttonImage;
    const colors = tempCustomTheme.colors;
    
    $preview.empty().removeAttr('style');
    
    if (image) {
        if (shape === 'circle') {
            $preview.css({
                'width': `${48 * size}px`,
                'height': `${48 * size}px`,
                'border-radius': '50%',
                'overflow': 'hidden',
                'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)'
            });
            $preview.html(`<img src="${image}" style="width: 100%; height: 100%; object-fit: cover;">`);
        } else {
            $preview.css({
                'display': 'inline-block',
                'border-radius': `${12 * size}px`,
                'overflow': 'hidden',
                'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)',
                'max-width': '200px'
            });
            $preview.html(`<img src="${image}" style="display: block; height: ${40 * size}px; width: auto; object-fit: contain;">`);
        }
    } else {
        const gradient = `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;
        
        if (shape === 'circle') {
            $preview.css({
                'width': `${48 * size}px`,
                'height': `${48 * size}px`,
                'border-radius': '50%',
                'background': gradient,
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'color': '#fff',
                'font-weight': 'bold',
                'font-size': `${16 * size}px`,
                'border': '2px solid rgba(255,255,255,0.3)',
                'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)'
            });
            $preview.html('<span>玉</span>');
        } else {
            $preview.css({
                'padding': `${8 * size}px ${14 * size}px`,
                'border-radius': `${12 * size}px`,
                'background': gradient,
                'display': 'inline-flex',
                'align-items': 'center',
                'gap': `${6 * size}px`,
                'color': '#fff',
                'font-weight': '600',
                'font-size': `${14 * size}px`,
                'border': '2px solid rgba(255,255,255,0.3)',
                'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)'
            });
            $preview.html(`<span style="display:flex;align-items:center;width:${18*size}px;height:${18*size}px;">${ICONS.store}</span><span>玉子市场</span>`);
        }
    }
}

// ===== 事件绑定 =====

function bindThemeEditorEvents($window) {
    $window.find('.tamako-editor-btn.save').on('click', () => closeThemeEditor(true));
    $window.find('.tamako-editor-btn.reset').on('click', resetThemeEditor);
    $window.find('.tamako-editor-btn.close').on('click', () => closeThemeEditor(false));
    
    $window.find('.tamako-color-preview, .tamako-color-hex').on('click', function(e) {
        e.stopPropagation();
        const colorKey = $(this).data('color-key');
        openColorPicker(colorKey);
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

function initColorPicker() {
    const $popup = $('#tamako-color-picker-popup');
    
    $popup.find('.tamako-picker-close').on('click', closeColorPicker);
    $popup.find('.tamako-picker-confirm').on('click', confirmColorPicker);
    
    if (!isMobileDevice()) {
        $popup.find('.tamako-picker-eyedropper').on('click', () => {
            closeColorPicker();
            startEyedropper(pickerState.colorKey);
        });
    }
    
    $popup.find('#tamako-hue').on('input', function() {
        updatePickerState({ hue: parseInt(this.value) });
        updateSLCanvas();
        updatePickerPreview();
    });
    
    const canvas = document.getElementById('tamako-sl-canvas');
    if (canvas) {
        canvas.addEventListener('click', handleSLCanvasClick);
        canvas.addEventListener('mousedown', startSLDrag);
        canvas.addEventListener('touchstart', startSLDragTouch, { passive: false });
    }
    
    $popup.find('.tamako-preview-hex').on('input', function() {
        let value = $(this).val().trim();
        if (!value.startsWith('#')) value = '#' + value;
        if (/^#[A-Fa-f0-9]{6}$/.test(value)) {
            const rgb = hexToRgb(value);
            if (rgb) {
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                updatePickerState({
                    hue: hsl.h,
                    saturation: hsl.s,
                    lightness: hsl.l
                });
                $('#tamako-hue').val(pickerState.hue);
                updateSLCanvas();
                updateSLCursor();
                $popup.find('.tamako-preview-color').css('background', value);
            }
        }
    });
}

function openColorPicker(colorKey) {
    const $popup = $('#tamako-color-picker-popup');
    updatePickerState({ colorKey });
    
    const currentColor = $(`.tamako-color-hex[data-color-key="${colorKey}"]`).val() || '#9370DB';
    const rgb = hexToRgb(currentColor);
    
    if (rgb) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        updatePickerState({
            hue: hsl.h,
            saturation: hsl.s,
            lightness: hsl.l
        });
    }
    
    $('#tamako-hue').val(pickerState.hue);
    updateSLCanvas();
    updateSLCursor();
    updatePickerPreview();
    
    $popup.show();
}

function closeColorPicker() {
    $('#tamako-color-picker-popup').hide();
    updatePickerState({ colorKey: null });
}

function confirmColorPicker() {
    const hex = $('#tamako-color-picker-popup .tamako-preview-hex').val();
    if (pickerState.colorKey && /^#[A-Fa-f0-9]{6}$/i.test(hex)) {
        $(`.tamako-color-preview[data-color-key="${pickerState.colorKey}"]`).css('background', hex);
        $(`.tamako-color-hex[data-color-key="${pickerState.colorKey}"]`).val(hex);
        updateTempColor(pickerState.colorKey, hex);
        updateButtonPreview();
        applyTempTheme();
    }
    closeColorPicker();
}

function updateSLCanvas() {
    const canvas = document.getElementById('tamako-sl-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const s = (x / width) * 100;
            const l = 100 - (y / height) * 100;
            const rgb = hslToRgb(pickerState.hue, s, l);
            ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

function updateSLCursor() {
    const $cursor = $('.tamako-sl-cursor');
    const canvas = document.getElementById('tamako-sl-canvas');
    if (!canvas || !$cursor.length) return;
    
    const x = (pickerState.saturation / 100) * canvas.width;
    const y = ((100 - pickerState.lightness) / 100) * canvas.height;
    
    $cursor.css({ left: x + 'px', top: y + 'px' });
}

function updatePickerPreview() {
    const rgb = hslToRgb(pickerState.hue, pickerState.saturation, pickerState.lightness);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    
    $('#tamako-color-picker-popup .tamako-preview-color').css('background', hex);
    $('#tamako-color-picker-popup .tamako-preview-hex').val(hex);
}

function handleSLCanvasClick(e) {
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    updatePickerState({
        saturation: (x / canvas.width) * 100,
        lightness: 100 - (y / canvas.height) * 100
    });
    
    updateSLCursor();
    updatePickerPreview();
}

function startSLDrag(e) {
    isDraggingSL = true;
    handleSLCanvasClick(e);
    
    const moveHandler = (e) => {
        if (!isDraggingSL) return;
        const canvas = document.getElementById('tamako-sl-canvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        let x = Math.max(0, Math.min(e.clientX - rect.left, canvas.width));
        let y = Math.max(0, Math.min(e.clientY - rect.top, canvas.height));
        
        updatePickerState({
            saturation: (x / canvas.width) * 100,
            lightness: 100 - (y / canvas.height) * 100
        });
        
        updateSLCursor();
        updatePickerPreview();
    };
    
    const upHandler = () => {
        isDraggingSL = false;
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
}

function startSLDragTouch(e) {
    e.preventDefault();
    isDraggingSL = true;
    
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    let x = Math.max(0, Math.min(touch.clientX - rect.left, canvas.width));
    let y = Math.max(0, Math.min(touch.clientY - rect.top, canvas.height));
    
    updatePickerState({
        saturation: (x / canvas.width) * 100,
        lightness: 100 - (y / canvas.height) * 100
    });
    
    updateSLCursor();
    updatePickerPreview();
    
    const moveHandler = (e) => {
        if (!isDraggingSL) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        let x = Math.max(0, Math.min(touch.clientX - rect.left, canvas.width));
        let y = Math.max(0, Math.min(touch.clientY - rect.top, canvas.height));
        
        updatePickerState({
            saturation: (x / canvas.width) * 100,
            lightness: 100 - (y / canvas.height) * 100
        });
        
        updateSLCursor();
        updatePickerPreview();
    };
    
    const endHandler = () => {
        isDraggingSL = false;
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('touchend', endHandler);
    };
    
    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('touchend', endHandler);
}

// ===== 吸管工具 =====

export function startEyedropper(colorKey) {
    if (isMobileDevice()) return;
    
    setEyedropperActive(true);
    setCurrentEditingColor(colorKey);
    
    if (window.EyeDropper) {
        useNativeEyeDropper();
        return;
    }
    
    const $window = $('#tamako-market-window');
    const $toggle = $('#tamako-market-toggle');
    
    $window.css('visibility', 'hidden');
    $toggle.css('visibility', 'hidden');
    
    $('body').addClass('tamako-eyedropper-mode');
    
    const $indicator = $('<div class="tamako-eyedropper-indicator">点击任意位置吸取颜色，ESC取消</div>');
    $('body').append($indicator);
    
    setTimeout(() => {
        $(document).on('click.eyedropper', handleEyedropperClick);
        $(document).on('keydown.eyedropper', handleEyedropperKeydown);
        $(document).on('mousemove.eyedropper', handleEyedropperMove);
    }, 50);
}

async function useNativeEyeDropper() {
    try {
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        
        if (result.sRGBHex && currentEditingColor) {
            const color = result.sRGBHex;
            $(`.tamako-color-preview[data-color-key="${currentEditingColor}"]`).css('background', color);
            $(`.tamako-color-hex[data-color-key="${currentEditingColor}"]`).val(color);
            updateTempColor(currentEditingColor, color);
            updateButtonPreview();
            applyTempTheme();
        }
    } catch (err) {
        // cancelled
    } finally {
        setEyedropperActive(false);
        setCurrentEditingColor(null);
    }
}

function stopEyedropper() {
    setEyedropperActive(false);
    setCurrentEditingColor(null);
    
    $('body').removeClass('tamako-eyedropper-mode');
    $('.tamako-eyedropper-indicator, .tamako-eyedropper-preview').remove();
    
    $('#tamako-market-window').css('visibility', 'visible');
    $('#tamako-market-toggle').css('visibility', 'visible');
    
    $(document).off('click.eyedropper');
    $(document).off('keydown.eyedropper');
    $(document).off('mousemove.eyedropper');
}

function getColorAtPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    if (!element) return null;
    
    const computedStyle = window.getComputedStyle(element);
    
    let color = computedStyle.backgroundColor;
    if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
        const rgb = parseColor(color);
        if (rgb) return rgbToHex(rgb.r, rgb.g, rgb.b);
    }
    
    color = computedStyle.color;
    if (color) {
        const rgb = parseColor(color);
        if (rgb && !(rgb.r === 0 && rgb.g === 0 && rgb.b === 0)) {
            return rgbToHex(rgb.r, rgb.g, rgb.b);
        }
    }
    
    let parent = element.parentElement;
    let depth = 0;
    while (parent && depth < 10) {
        const parentStyle = window.getComputedStyle(parent);
        color = parentStyle.backgroundColor;
        if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
            const rgb = parseColor(color);
            if (rgb) return rgbToHex(rgb.r, rgb.g, rgb.b);
        }
        parent = parent.parentElement;
        depth++;
    }
    
    return '#808080';
}

function handleEyedropperClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const color = getColorAtPoint(e.clientX, e.clientY);
    
    if (color && currentEditingColor) {
        $(`.tamako-color-preview[data-color-key="${currentEditingColor}"]`).css('background', color);
        $(`.tamako-color-hex[data-color-key="${currentEditingColor}"]`).val(color);
        updateTempColor(currentEditingColor, color);
        updateButtonPreview();
        applyTempTheme();
    }
    
    stopEyedropper();
}

function handleEyedropperKeydown(e) {
    if (e.key === 'Escape') {
        stopEyedropper();
    }
}

function handleEyedropperMove(e) {
    let $preview = $('.tamako-eyedropper-preview');
    if (!$preview.length) {
        $preview = $('<div class="tamako-eyedropper-preview"><div class="ep-color"></div><div class="ep-value"></div></div>');
        $('body').append($preview);
    }
    
    const color = getColorAtPoint(e.clientX, e.clientY);
    
    let left = e.clientX + 20;
    let top = e.clientY + 20;
    
    if (left + 120 > window.innerWidth) left = e.clientX - 130;
    if (top + 40 > window.innerHeight) top = e.clientY - 50;
    
    $preview.css({ left: left + 'px', top: top + 'px' });
    $preview.find('.ep-color').css('background', color || '#808080');
    $preview.find('.ep-value').text(color || '---');
}
