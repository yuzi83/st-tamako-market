/* index.js */
/**
 * 玉子市场 - SillyTavern 悬浮窗扩展
 * @version 2.5.3
 * 功能：捕获XML标签内容、自定义美化器、消息删除检测、移动端适配、主题编辑器
 * 修改：删除背景渐变设置、增加更多字体选项
 */

const extensionName = 'TamakoMarket';

const ICONS = {
    store: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 7h16v2H4V7zm-1 4h18v2H3v-2zm2 4h14v6H5v-6zm2 2v2h10v-2H7z"/><path d="M4 3h16l2 4H2l2-4z"/></svg>`,
    minimize: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>`,
    expand: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
    broom: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.36 2.72L20.78 4.14L15.06 9.85C16.13 11.39 16.28 13.24 15.38 14.44L9.06 8.12C10.26 7.22 12.11 7.37 13.65 8.44L19.36 2.72M5.93 17.57C3.92 15.56 2.69 13.16 2.35 10.92L7.23 8.83L14.67 16.27L12.58 21.15C10.34 20.81 7.94 19.58 5.93 17.57Z"/></svg>`,
    palette: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    dango: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="3"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="19" r="3"/><rect x="11" y="2" width="2" height="20"/></svg>`,
    box: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15zM5 15.91l6 3.38v-6.71L5 9.21v6.7zm14 0v-6.7l-6 3.37v6.71l6-3.38z"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
    eyedropper: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.71 5.63l-2.34-2.34a1 1 0 0 0-1.41 0l-3.12 3.12-1.23-1.21a1 1 0 0 0-1.42 0L10 6.41a1 1 0 0 0 0 1.41l.71.72-7.37 7.37a2 2 0 0 0-.59 1.42V21h3.67a2 2 0 0 0 1.42-.59l7.37-7.37.72.71a1 1 0 0 0 1.41 0l1.21-1.21a1 1 0 0 0 0-1.42l-1.21-1.23 3.12-3.12a1 1 0 0 0 .25-1.14zM5.41 19H5v-.41l7.37-7.37 1.41 1.41L6.41 19z"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
    reset: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>`,
};

const defaultSettings = {
    enabled: true,
    windowX: null,
    windowY: null,
    windowWidth: 380,
    windowHeight: 450,
    autoCapture: true,
    captureTags: ['recall', 'scene_direction'],
    theme: 'tamako',
    maxScanMessages: 50,
    maxStoredPlots: 50,
    toggleX: null,
    toggleY: null,
    beautifier: { enabled: false, template: '', fileName: '' },
    customTheme: null,
};

const themes = {
    tamako: { name: '🌸 玉子市场', primary: '#FFB6C1', secondary: '#DDA0DD', bg: 'linear-gradient(135deg, #FFF5F7 0%, #FFFFFF 50%, #F8F0FF 100%)', surface: '#FFFFFF', surfaceAlt: '#FFF8FA', text: '#333333', textMuted: '#888888', border: 'rgba(0, 0, 0, 0.1)' },
    ocean: { name: '🌊 海边小店', primary: '#87CEEB', secondary: '#5F9EA0', bg: 'linear-gradient(135deg, #F0F8FF 0%, #FFFFFF 50%, #E6F3FF 100%)', surface: '#FFFFFF', surfaceAlt: '#F0F8FF', text: '#333333', textMuted: '#888888', border: 'rgba(0, 0, 0, 0.1)' },
    sunflower: { name: '🌻 向日葵田', primary: '#FFD700', secondary: '#FFA500', bg: 'linear-gradient(135deg, #FFFEF0 0%, #FFFFFF 50%, #FFF8E7 100%)', surface: '#FFFFFF', surfaceAlt: '#FFFEF0', text: '#333333', textMuted: '#888888', border: 'rgba(0, 0, 0, 0.1)' },
    night: { name: '🌙 夜间模式', primary: '#9370DB', secondary: '#6A5ACD', bg: 'linear-gradient(135deg, #2D2D3A 0%, #1E1E28 50%, #252532 100%)', surface: '#1E1E28', surfaceAlt: '#2D2D3A', text: '#E0E0E0', textMuted: '#888888', border: '#3D3D4A' },
};

const defaultCustomTheme = {
    name: '自定义',
    basedOn: 'tamako',
    colors: {
        primary: '#FFB6C1',
        secondary: '#DDA0DD',
        bg: 'linear-gradient(135deg, #FFF5F7 0%, #FFFFFF 50%, #F8F0FF 100%)',
        surface: '#FFFFFF',
        surfaceAlt: '#FFF8FA',
        text: '#333333',
        textMuted: '#888888',
        border: 'rgba(0, 0, 0, 0.1)'
    },
    borderRadius: 16,
    opacity: 100,
    fontFamily: 'system'
};

const fontOptions = {
    system: { name: '📱 系统默认', value: "'Segoe UI', 'Microsoft YaHei', sans-serif" },
    cute: { name: '🎀 可爱圆润', value: "'Comic Sans MS', 'Microsoft YaHei', cursive" },
    elegant: { name: '📜 优雅衬线', value: "Georgia, 'Noto Serif SC', serif" },
    mono: { name: '💻 等宽代码', value: "Consolas, 'Source Code Pro', monospace" },
    pixel: { name: '🎮 像素复古', value: "'VT323', 'Courier New', monospace" },
    handwrite: { name: '✍️ 手写体', value: "'Segoe Script', 'STXingkai', cursive" },
    rounded: { name: '⭕ 圆体', value: "'Yuanti SC', 'Microsoft YaHei', sans-serif" },
    songti: { name: '📖 宋体', value: "'Noto Serif SC', 'SimSun', serif" },
    heiti: { name: '🔲 黑体', value: "'Noto Sans SC', 'SimHei', sans-serif" },
    kaiti: { name: '🖌️ 楷体', value: "'STKaiti', 'KaiTi', serif" }
};

const deraMessages = {
    empty: ['德拉在打瞌睡...', '店里空空的，德拉好无聊~', '德拉等着新货到来！'],
    newItem: ['德拉发现了新货！', '有新商品入库啦！', '德拉：这个看起来不错哦~'],
    scanning: ['德拉正在努力搜寻...', '等等，德拉在找东西~', '德拉的雷达启动中...'],
    found: ['德拉找到了好多东西！', '搜寻完毕！德拉很棒吧~', '库存已更新，德拉辛苦了！'],
    delete: ['德拉帮你打包好了~', '清理完毕！店铺更整洁了~', '德拉：这些就交给我处理吧！'],
    noResult: ['德拉找不到这个呢...', '没有匹配的商品哦~', '德拉翻遍了也没找到~'],
    tooMany: ['商品太多了，德拉只拿了一部分~', '库存爆满！德拉尽力了~'],
    loading: ['德拉正在准备...', '稍等一下哦~', '德拉在努力加载中...'],
    theme: ['德拉帮你换装啦~', '新风格真好看！', '德拉喜欢这个颜色~'],
};

let capturedPlots = [];
let deleteMode = false;
let extensionEnabled = true;
let searchQuery = '';
let currentTheme = 'tamako';
let cachedTemplate = null;
let cachedTemplateSource = '';
let isThemeEditorOpen = false;
let isEyedropperActive = false;
let currentEditingColor = null;
let tempCustomTheme = null;

let resizeState = {
    isResizing: false,
    handle: '',
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    element: null,
    pointerId: null
};

let dragState = {
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
    pointerId: null
};

let validateDebounceTimer = null;
let beautifierLoadTimeout = null;

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768 || ('ontouchstart' in window);
}

function getDeraMessage(type) {
    const messages = deraMessages[type] || deraMessages.empty;
    return messages[Math.floor(Math.random() * messages.length)];
}

function getDefaultWindowPosition() {
    const isMobile = isMobileDevice();
    const width = isMobile ? Math.min(340, window.innerWidth - 20) : defaultSettings.windowWidth;
    const height = isMobile ? Math.min(400, window.innerHeight - 100) : defaultSettings.windowHeight;
    return {
        x: Math.max(10, Math.floor((window.innerWidth - width) / 2)),
        y: Math.max(60, Math.floor((window.innerHeight - height) / 2) - 50),
        width, height
    };
}

function getDefaultTogglePosition() {
    const isMobile = isMobileDevice();
    return isMobile ? { x: Math.max(10, window.innerWidth - 130), y: Math.max(10, window.innerHeight - 160) } : { x: Math.max(10, window.innerWidth - 330), y: 10 };
}

function getSettings() {
    try {
        const context = SillyTavern.getContext();
        if (context?.extensionSettings) {
            if (!context.extensionSettings[extensionName]) context.extensionSettings[extensionName] = { ...defaultSettings };
            const s = context.extensionSettings[extensionName];
            if (!s.captureTags) s.captureTags = [...defaultSettings.captureTags];
            if (!s.maxScanMessages) s.maxScanMessages = defaultSettings.maxScanMessages;
            if (!s.maxStoredPlots) s.maxStoredPlots = defaultSettings.maxStoredPlots;
            if (!s.beautifier) s.beautifier = { ...defaultSettings.beautifier };
            if (s.beautifier.fileName === undefined) s.beautifier.fileName = '';
            if (s.customTheme === undefined) s.customTheme = null;
            return s;
        }
    } catch (e) { console.warn('[玉子市场] 无法获取设置:', e); }
    return { ...defaultSettings };
}

function saveSetting(key, value) {
    try {
        const settings = getSettings();
        settings[key] = value;
        SillyTavern.getContext()?.saveSettingsDebounced?.();
    } catch (e) { console.warn('[玉子市场] 保存失败:', e); }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function parseColor(color) {
    if (!color) return null;
    if (color.startsWith('#')) {
        return hexToRgb(color);
    }
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
        return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
    }
    return null;
}

function getCurrentThemeData() {
    const settings = getSettings();
    if (currentTheme === 'custom' && settings.customTheme) {
        return settings.customTheme;
    }
    const preset = themes[currentTheme] || themes.tamako;
    return {
        name: preset.name,
        basedOn: currentTheme,
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
        borderRadius: 16,
        opacity: 100,
        fontFamily: 'system'
    };
}

function applyThemeStyles(themeData, $window, $toggle) {
    const colors = themeData.colors;
    const radius = themeData.borderRadius + 'px';
    const opacity = themeData.opacity / 100;
    const font = fontOptions[themeData.fontFamily]?.value || fontOptions.system.value;
    
    const cssVars = {
        '--tamako-primary': colors.primary,
        '--tamako-secondary': colors.secondary,
        '--tamako-bg': colors.bg,
        '--tamako-surface': colors.surface,
        '--tamako-surface-alt': colors.surfaceAlt,
        '--tamako-text': colors.text,
        '--tamako-text-muted': colors.textMuted,
        '--tamako-border': colors.border,
        '--tamako-radius': radius,
        '--tamako-opacity': opacity,
        '--tamako-font': font,
        '--theme-primary': colors.primary,
        '--theme-secondary': colors.secondary
    };
    
    if ($window && $window.length) {
        $window.css(cssVars);
        $window.css({
            'border-radius': radius,
            'opacity': opacity,
            'font-family': font
        });
    }
    
    if ($toggle && $toggle.length) {
        $toggle.css({
            '--theme-primary': colors.primary,
            '--theme-secondary': colors.secondary,
            'border-radius': radius,
            'font-family': font
        });
    }
}

function applyTheme(themeName, customData = null) {
    const $window = $('#tamako-market-window');
    const $toggle = $('#tamako-market-toggle');
    
    $window.removeClass('theme-tamako theme-ocean theme-sunflower theme-night theme-custom');
    $toggle.removeClass('theme-tamako theme-ocean theme-sunflower theme-night theme-custom');
    
    if (themeName === 'custom' && customData) {
        currentTheme = 'custom';
        $window.addClass('theme-custom');
        $toggle.addClass('theme-custom');
        applyThemeStyles(customData, $window, $toggle);
        saveSetting('theme', 'custom');
        saveSetting('customTheme', customData);
    } else {
        currentTheme = themeName;
        const preset = themes[themeName] || themes.tamako;
        $window.addClass(`theme-${themeName}`);
        $toggle.addClass(`theme-${themeName}`);
        
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
            borderRadius: 16,
            opacity: 100,
            fontFamily: 'system'
        };
        applyThemeStyles(themeData, $window, $toggle);
        saveSetting('theme', themeName);
    }
    
    $('#tamako-theme-selector').val(themeName);
}

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
    
    const themeOptions = Object.entries(themes).map(([key, theme]) => 
        `<option value="${key}" ${themeData.basedOn === key ? 'selected' : ''}>${theme.name}</option>`
    ).join('');
    
    const fontOptionsHtml = Object.entries(fontOptions).map(([key, font]) =>
        `<option value="${key}" ${themeData.fontFamily === key ? 'selected' : ''}>${font.name}</option>`
    ).join('');
    
    return `
        <div class="tamako-theme-editor">
            <div class="tamako-editor-header">
                <span>🎨 主题编辑器</span>
                <div class="tamako-editor-actions">
                    <button class="tamako-editor-btn save" title="保存">${ICONS.check}</button>
                    <button class="tamako-editor-btn reset" title="重置">${ICONS.reset}</button>
                    <button class="tamako-editor-btn close" title="关闭">${ICONS.close}</button>
                </div>
            </div>
            
            <div class="tamako-editor-body">
                <div class="tamako-editor-section">
                    <div class="tamako-section-title">基础模板</div>
                    <select id="tamako-base-theme" class="tamako-editor-select">
                        ${themeOptions}
                    </select>
                </div>
                
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
                        <label>圆角大小</label>
                        <input type="range" id="tamako-border-radius" min="0" max="24" value="${themeData.borderRadius}">
                        <span class="tamako-slider-value">${themeData.borderRadius}px</span>
                    </div>
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
                    <div class="tamako-font-preview">预览：德拉的玉子市场 ABC 123</div>
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

function openThemeEditor() {
    if (isThemeEditorOpen) return;
    isThemeEditorOpen = true;
    
    const $window = $('#tamako-market-window');
    tempCustomTheme = JSON.parse(JSON.stringify(getCurrentThemeData()));
    
    $window.find('.tamako-tabs, .tamako-content, .tamako-delete-bar').hide();
    $window.find('.tamako-theme-panel').hide();
    
    const editorHtml = createThemeEditorContent();
    $window.append(`<div class="tamako-editor-container">${editorHtml}</div>`);
    
    bindThemeEditorEvents($window);
    initColorPicker();
    updateFontPreview();
}

function closeThemeEditor(save = false) {
    if (!isThemeEditorOpen) return;
    isThemeEditorOpen = false;
    
    const $window = $('#tamako-market-window');
    
    if (save && tempCustomTheme) {
        applyTheme('custom', tempCustomTheme);
        showDeraToast('theme');
    } else {
        const settings = getSettings();
        if (settings.theme === 'custom' && settings.customTheme) {
            applyTheme('custom', settings.customTheme);
        } else {
            applyTheme(settings.theme || 'tamako');
        }
    }
    
    tempCustomTheme = null;
    $window.find('.tamako-editor-container').remove();
    $window.find('.tamako-tabs, .tamako-content[data-content="current"]').show();
    
    if (deleteMode) {
        $window.find('.tamako-delete-bar').show();
    }
}

function updateFontPreview() {
    const fontKey = $('#tamako-font-family').val() || 'system';
    const fontValue = fontOptions[fontKey]?.value || fontOptions.system.value;
    $('.tamako-font-preview').css('font-family', fontValue);
}

function bindThemeEditorEvents($window) {
    $window.find('.tamako-editor-btn.save').on('click', () => closeThemeEditor(true));
    $window.find('.tamako-editor-btn.reset').on('click', resetThemeEditor);
    $window.find('.tamako-editor-btn.close').on('click', () => closeThemeEditor(false));
    
    $window.find('#tamako-base-theme').on('change', function() {
        const baseName = this.value;
        const preset = themes[baseName];
        if (preset) {
            tempCustomTheme = {
                name: '自定义',
                basedOn: baseName,
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
                borderRadius: tempCustomTheme?.borderRadius || 16,
                opacity: tempCustomTheme?.opacity || 100,
                fontFamily: tempCustomTheme?.fontFamily || 'system'
            };
            refreshEditorColors();
            applyTempTheme();
        }
    });
    
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
            applyTempTheme();
        }
    });
    
    $window.find('#tamako-border-radius').on('input', function() {
        const value = parseInt(this.value);
        $(this).siblings('.tamako-slider-value').text(value + 'px');
        if (tempCustomTheme) {
            tempCustomTheme.borderRadius = value;
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
}

function resetThemeEditor() {
    const baseName = $('#tamako-base-theme').val() || 'tamako';
    const preset = themes[baseName];
    
    tempCustomTheme = {
        name: '自定义',
        basedOn: baseName,
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
        borderRadius: 16,
        opacity: 100,
        fontFamily: 'system'
    };
    
    refreshEditorColors();
    
    $('#tamako-border-radius').val(16).siblings('.tamako-slider-value').text('16px');
    $('#tamako-opacity').val(100).siblings('.tamako-slider-value').text('100%');
    $('#tamako-font-family').val('system');
    updateFontPreview();
    
    applyTempTheme();
}

let pickerState = {
    colorKey: null,
    hue: 0,
    saturation: 100,
    lightness: 50
};

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
        pickerState.hue = parseInt(this.value);
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
                pickerState.hue = hsl.h;
                pickerState.saturation = hsl.s;
                pickerState.lightness = hsl.l;
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
    pickerState.colorKey = colorKey;
    
    const currentColor = $(`.tamako-color-hex[data-color-key="${colorKey}"]`).val() || '#FFB6C1';
    const rgb = hexToRgb(currentColor);
    
    if (rgb) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        pickerState.hue = hsl.h;
        pickerState.saturation = hsl.s;
        pickerState.lightness = hsl.l;
    }
    
    $('#tamako-hue').val(pickerState.hue);
    updateSLCanvas();
    updateSLCursor();
    updatePickerPreview();
    
    $popup.show();
}

function closeColorPicker() {
    $('#tamako-color-picker-popup').hide();
    pickerState.colorKey = null;
}

function confirmColorPicker() {
    const hex = $('#tamako-color-picker-popup .tamako-preview-hex').val();
    if (pickerState.colorKey && /^#[A-Fa-f0-9]{6}$/i.test(hex)) {
        $(`.tamako-color-preview[data-color-key="${pickerState.colorKey}"]`).css('background', hex);
        $(`.tamako-color-hex[data-color-key="${pickerState.colorKey}"]`).val(hex);
        updateTempColor(pickerState.colorKey, hex);
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
    
    $cursor.css({
        left: x + 'px',
        top: y + 'px'
    });
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
    
    pickerState.saturation = (x / canvas.width) * 100;
    pickerState.lightness = 100 - (y / canvas.height) * 100;
    
    updateSLCursor();
    updatePickerPreview();
}

let isDraggingSL = false;

function startSLDrag(e) {
    isDraggingSL = true;
    handleSLCanvasClick(e);
    
    const moveHandler = (e) => {
        if (!isDraggingSL) return;
        const canvas = document.getElementById('tamako-sl-canvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        
        x = Math.max(0, Math.min(x, canvas.width));
        y = Math.max(0, Math.min(y, canvas.height));
        
        pickerState.saturation = (x / canvas.width) * 100;
        pickerState.lightness = 100 - (y / canvas.height) * 100;
        
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
    let x = touch.clientX - rect.left;
    let y = touch.clientY - rect.top;
    
    x = Math.max(0, Math.min(x, canvas.width));
    y = Math.max(0, Math.min(y, canvas.height));
    
    pickerState.saturation = (x / canvas.width) * 100;
    pickerState.lightness = 100 - (y / canvas.height) * 100;
    
    updateSLCursor();
    updatePickerPreview();
    
    const moveHandler = (e) => {
        if (!isDraggingSL) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        let x = touch.clientX - rect.left;
        let y = touch.clientY - rect.top;
        
        x = Math.max(0, Math.min(x, canvas.width));
        y = Math.max(0, Math.min(y, canvas.height));
        
        pickerState.saturation = (x / canvas.width) * 100;
        pickerState.lightness = 100 - (y / canvas.height) * 100;
        
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

// ===== 吸管工具（仅 PC 端） =====

function startEyedropper(colorKey) {
    if (isMobileDevice()) return;
    
    isEyedropperActive = true;
    currentEditingColor = colorKey;
    
    if (window.EyeDropper) {
        useNativeEyeDropper();
        return;
    }
    
    const $window = $('#tamako-market-window');
    const $toggle = $('#tamako-market-toggle');
    
    $window.css('visibility', 'hidden');
    $toggle.css('visibility', 'hidden');
    
    $('body').addClass('tamako-eyedropper-mode');
    
    const $indicator = $('<div class="tamako-eyedropper-indicator">🎯 点击任意位置吸取颜色，ESC取消</div>');
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
            applyTempTheme();
        }
    } catch (err) {
        console.log('[玉子市场] EyeDropper 取消或出错:', err);
    } finally {
        isEyedropperActive = false;
        currentEditingColor = null;
    }
}

function stopEyedropper() {
    isEyedropperActive = false;
    currentEditingColor = null;
    
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
    
    if (left + 120 > window.innerWidth) {
        left = e.clientX - 130;
    }
    if (top + 40 > window.innerHeight) {
        top = e.clientY - 50;
    }
    
    $preview.css({
        left: left + 'px',
        top: top + 'px'
    });
    $preview.find('.ep-color').css('background', color || '#808080');
    $preview.find('.ep-value').text(color || '---');
}

function resetWindowPosition() {
    const $window = $('#tamako-market-window');
    const pos = getDefaultWindowPosition();
    saveSetting('windowX', null); saveSetting('windowY', null);
    saveSetting('windowWidth', pos.width); saveSetting('windowHeight', pos.height);
    $window.css({ left: pos.x + 'px', top: pos.y + 'px', width: pos.width + 'px', height: pos.height + 'px' });
    $window.removeClass('minimized');
    $window.find('.tamako-btn.minimize').html(ICONS.minimize);
    toggleWindow(true);
}

function resetTogglePosition() {
    const $toggle = $('#tamako-market-toggle');
    const pos = getDefaultTogglePosition();
    saveSetting('toggleX', null); saveSetting('toggleY', null);
    $toggle.css({ left: pos.x + 'px', top: pos.y + 'px', right: 'auto', bottom: 'auto' });
}

function extractAMCodes(content) {
    const matches = content.match(/AM\d{4}/gi);
    return matches ? [...new Set(matches.map(m => m.toUpperCase()))] : [];
}

function formatAMCodes(codes) {
    if (codes.length === 0) return '暂时没有商品入库哦~';
    if (codes.length <= 3) return codes.join(', ');
    return `${codes.slice(0, 3).join(', ')} 等${codes.length}件`;
}

function showDeraToast(type) {
    const $toast = $('#tamako-dera-toast');
    $toast.text(getDeraMessage(type)).addClass('show');
    setTimeout(() => $toast.removeClass('show'), 2000);
}

function highlightText(text, query) {
    if (!query) return text;
    return text.replace(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark>$1</mark>');
}

function constrainPosition(x, y, width, height) {
    return {
        x: Math.max(0, Math.min(x, Math.max(0, window.innerWidth - width))),
        y: Math.max(0, Math.min(y, Math.max(0, window.innerHeight - height)))
    };
}

function hideBeautifierFrame($window) {
    const iframe = $window.find('.tamako-beautifier-frame')[0];
    if (iframe) iframe.style.visibility = 'hidden';
}

function showBeautifierFrame($window) {
    const iframe = $window.find('.tamako-beautifier-frame')[0];
    if (iframe) iframe.style.visibility = 'visible';
}

function validateCapturedPlots() {
    if (!extensionEnabled) return;
    if (validateDebounceTimer) clearTimeout(validateDebounceTimer);
    validateDebounceTimer = setTimeout(() => doValidateCapturedPlots(), 300);
}

function doValidateCapturedPlots() {
    try {
        const context = SillyTavern.getContext();
        if (!context?.chat) return;
        
        const chatLength = context.chat.length;
        const originalLength = capturedPlots.length;
        
        capturedPlots = capturedPlots.filter(plot => {
            if (plot.messageIndex >= chatLength) return false;
            const msg = context.chat[plot.messageIndex];
            if (!msg || !msg.is_user || !msg.mes) return false;
            const tags = getSettings().captureTags || [];
            for (const tag of tags) {
                if (plot.content.includes(`<${tag}`) && msg.mes.includes(`<${tag}`)) return true;
            }
            return false;
        });
        
        if (capturedPlots.length !== originalLength) {
            capturedPlots = [];
            const settings = getSettings();
            const maxScan = settings.maxScanMessages || 50;
            const maxStore = settings.maxStoredPlots || 50;
            let scannedCount = 0;
            
            for (let i = chatLength - 1; i >= 0 && scannedCount < maxScan; i--) {
                if (!context.chat[i]?.is_user) continue;
                scannedCount++;
                const extracted = extractPlotContent(context.chat[i].mes);
                if (!extracted) continue;
                capturedPlots.push({
                    content: extracted.content,
                    rawMessage: extracted.rawMessage,
                    timestamp: Date.now() - (chatLength - i) * 1000,
                    messageIndex: i
                });
            }
            
            capturedPlots.sort((a, b) => a.messageIndex - b.messageIndex);
            if (capturedPlots.length > maxStore) capturedPlots = capturedPlots.slice(-maxStore);
            
            if (capturedPlots.length > 0) {
                const latest = capturedPlots[capturedPlots.length - 1];
                updateCurrentContent(latest.content, latest.rawMessage);
            } else {
                updateCurrentContent('', '');
            }
            updateHistoryList();
        }
    } catch (e) {
        console.error('[玉子市场] 验证捕获记录失败:', e);
    }
}

function parseBeautifierTemplate(input) {
    if (!input?.trim()) return null;
    if (input === cachedTemplateSource && cachedTemplate) return cachedTemplate;
    
    const trimmed = input.trim();
    let result = null;
    let regexInfo = null;
    
    try {
        const json = JSON.parse(trimmed);
        if (json.replaceString) {
            let htmlContent = json.replaceString;
            htmlContent = htmlContent
                .replace(/^```html\s*\n?/i, '')
                .replace(/^```\s*\n?/, '')
                .replace(/\n?```\s*$/, '')
                .trim();
            
            if (htmlContent.includes('<!DOCTYPE') || htmlContent.includes('<html') || htmlContent.includes('<body')) {
                result = htmlContent;
                if (json.findRegex) {
                    regexInfo = { findRegex: json.findRegex, scriptName: json.scriptName || '' };
                }
            }
        }
    } catch (e) {}
    
    if (!result) {
        let htmlContent = trimmed;
        if (htmlContent.startsWith('```html') || htmlContent.startsWith('```\n<!DOCTYPE')) {
            htmlContent = htmlContent
                .replace(/^```html\s*\n?/i, '')
                .replace(/^```\s*\n?/, '')
                .replace(/\n?```\s*$/, '')
                .trim();
        }
        if (htmlContent.includes('<!DOCTYPE') || /^<html/i.test(htmlContent)) {
            result = htmlContent;
        }
    }
    
    if (!result && trimmed.includes('<body') && trimmed.includes('</body>')) {
        result = trimmed;
    }
    
    if (result) { 
        cachedTemplateSource = input; 
        cachedTemplate = { html: result, regexInfo };
        return cachedTemplate;
    }
    
    return null;
}

function validateTemplate(templateData) {
    if (!templateData || !templateData.html) return { valid: false, error: '模板为空' };
    const html = templateData.html;
    if (!html.includes('<body') && !html.includes('<div') && !html.includes('<html')) {
        return { valid: false, error: '模板缺少有效的 HTML 结构' };
    }
    return { valid: true };
}

function extractAllChatData() {
    const data = { chat: [], tags: {} };
    
    try {
        const context = SillyTavern.getContext();
        if (!context?.chat) return data;
        
        data.chat = context.chat.map((msg) => {
            if (!msg) return null;
            return {
                mes: msg.mes || '',
                is_user: msg.is_user || false,
                extra: msg.extra ? { qrf_plot: msg.extra.qrf_plot } : null,
                qrf_plot: msg.qrf_plot,
                swipes: msg.swipes ? msg.swipes.map(s => {
                    if (typeof s === 'string') return s;
                    if (s && s.extra && s.extra.qrf_plot) return { extra: { qrf_plot: s.extra.qrf_plot } };
                    return null;
                }).filter(Boolean) : null
            };
        }).filter(Boolean);
        
        const tagNames = ['stage', 'recall', 'prologue', 'plot', 'cast', 'scene_direction', 'content', 'file'];
        for (const tag of tagNames) {
            data.tags[tag] = extractTagFromChatHistory(context.chat, tag);
        }
        data.tags.contentFile = extractFileFromContentTag(context.chat);
    } catch (e) {
        console.error('[玉子市场] 提取聊天数据失败:', e);
    }
    
    return data;
}

function extractTagFromChatHistory(chat, tagName) {
    if (!chat) return '';
    const regex = new RegExp(`(?<!\`)<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>(?!\`)`, 'i');
    
    for (let i = chat.length - 1; i >= 0; i--) {
        const msg = chat[i];
        if (!msg) continue;
        const sources = [msg.extra?.qrf_plot, msg.mes, msg.qrf_plot];
        if (msg.swipes && Array.isArray(msg.swipes)) {
            for (const swipe of msg.swipes) {
                if (typeof swipe === 'string') sources.push(swipe);
                else if (swipe?.extra?.qrf_plot) sources.push(swipe.extra.qrf_plot);
            }
        }
        for (const src of sources) {
            if (!src) continue;
            const match = src.match(regex);
            if (match && match[1]) return match[1].trim();
        }
    }
    return '';
}

function extractFileFromContentTag(chat) {
    if (!chat) return '';
    for (let i = chat.length - 1; i >= 0; i--) {
        const msg = chat[i];
        if (!msg) continue;
        const sources = [msg.extra?.qrf_plot, msg.mes, msg.qrf_plot];
        if (msg.swipes && Array.isArray(msg.swipes)) {
            for (const swipe of msg.swipes) {
                if (typeof swipe === 'string') sources.push(swipe);
                else if (swipe?.extra?.qrf_plot) sources.push(swipe.extra.qrf_plot);
            }
        }
        for (const src of sources) {
            if (!src) continue;
            const contentPattern = /(?<!`)<content(?:\s[^>]*)?>([\\s\\S]*?)<\/content>(?!`)/gi;
            let contentMatch;
            while ((contentMatch = contentPattern.exec(src)) !== null) {
                const contentInner = contentMatch[1];
                const fileMatch = contentInner.match(/(?<!`)<file(?:\s[^>]*)?>([\\s\\S]*?)<\/file>(?!`)/i);
                if (fileMatch && fileMatch[1]) return fileMatch[1].trim();
            }
        }
    }
    return '';
}

function injectDataIntoTemplate(html, rawMessage, fullChatData) {
    const injectionScript = `
<script>
(function() {
    try {
        if (window.name && window.name.startsWith('TAMAKO_DATA:')) {
            var dataStr = window.name.substring(12);
            var parsed = JSON.parse(dataStr);
            window.TAMAKO_INJECTED_CHAT = parsed.chat || [];
            window.TAMAKO_INJECTED_TAGS = parsed.tags || {};
            window.TAMAKO_INJECTED_RAW = parsed.raw || '';
        }
    } catch(e) {
        console.log('[玉子市场] 数据解析跳过，使用模板自带函数');
    }
    
    window.getSTChat = window.getSTChat || function() {
        if (window.TAMAKO_INJECTED_CHAT && window.TAMAKO_INJECTED_CHAT.length > 0) {
            return window.TAMAKO_INJECTED_CHAT;
        }
        try {
            if (window.parent && window.parent.SillyTavern) {
                var ctx = window.parent.SillyTavern.getContext();
                if (ctx && ctx.chat) return ctx.chat;
            }
        } catch(e) {}
        return [];
    };
    
    window.getContext = window.getContext || function() {
        return { chat: window.getSTChat() };
    };
    
    console.log('[玉子市场] iframe 初始化完成');
})();
<\/script>
`;
    
    let modifiedHtml = html;
    
    if (modifiedHtml.includes('</head>')) {
        modifiedHtml = modifiedHtml.replace('</head>', injectionScript + '</head>');
    } else if (modifiedHtml.includes('<body')) {
        modifiedHtml = modifiedHtml.replace(/<body/i, injectionScript + '<body');
    } else {
        modifiedHtml = injectionScript + modifiedHtml;
    }
    
    return modifiedHtml;
}

function renderWithBeautifier($container, rawMessage, templateData) {
    try {
        let html = templateData.html;
        
        if (html.includes('$1')) {
            html = html.replace(/\$1/g, function() {
                return rawMessage || '';
            });
        }
        
        const fullChatData = extractAllChatData();
        
        html = injectDataIntoTemplate(html, rawMessage, fullChatData);
        
        $container.css('position', 'relative');
        
        let iframe = $container.find('.tamako-beautifier-frame')[0];
        let $loading = $container.find('.tamako-beautifier-loading');
        
        if (beautifierLoadTimeout) {
            clearTimeout(beautifierLoadTimeout);
            beautifierLoadTimeout = null;
        }
        
        if (!iframe || !$loading.length) {
            $container.empty();
            $container.append(`
                <div class="tamako-beautifier-loading">
                    <span class="icon">🐔</span>
                    <span class="message">${getDeraMessage('loading')}</span>
                </div>
            `);
            $container.append(`<iframe class="tamako-beautifier-frame" frameborder="0" sandbox="allow-scripts allow-same-origin"></iframe>`);
            iframe = $container.find('.tamako-beautifier-frame')[0];
            $loading = $container.find('.tamako-beautifier-loading');
        }
        
        if (!iframe) return false;
        
        const $iframe = $(iframe);
        $iframe.css('opacity', '0');
        $loading.show();
        
        if (iframe._blobUrl) {
            URL.revokeObjectURL(iframe._blobUrl);
            iframe._blobUrl = null;
        }
        
        iframe.onload = null;
        iframe.onload = function() {
            if (beautifierLoadTimeout) {
                clearTimeout(beautifierLoadTimeout);
                beautifierLoadTimeout = null;
            }
            setTimeout(() => {
                $loading.hide();
                $iframe.css('opacity', '1');
            }, 50);
        };
        
        beautifierLoadTimeout = setTimeout(() => {
            if ($loading.is(':visible')) {
                console.warn('[玉子市场] iframe 加载超时，强制显示');
                $loading.hide();
                $iframe.css('opacity', '1');
            }
        }, 3000);
        
        const dataPayload = JSON.stringify({
            chat: fullChatData.chat,
            tags: fullChatData.tags,
            raw: rawMessage
        });
        
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        iframe._blobUrl = blobUrl;
        
        iframe.name = 'TAMAKO_DATA:' + dataPayload;
        iframe.src = blobUrl;
        
        return true;
    } catch (e) {
        console.error('[玉子市场] 美化器渲染失败:', e);
        return false;
    }
}

function clearTemplateCache() { cachedTemplate = null; cachedTemplateSource = ''; }

function createWindow() {
    if (document.getElementById('tamako-market-window')) return $('#tamako-market-window');

    const themeOptions = Object.entries(themes).map(([key, theme]) => 
        `<option value="${key}">${theme.name}</option>`
    ).join('') + '<option value="custom">✨ 自定义</option>';
    const mobileClass = isMobileDevice() ? 'tamako-mobile' : '';
    const settings = getSettings();
    const savedTheme = settings.theme || 'tamako';

    const windowHtml = `
        <div id="tamako-market-window" class="tamako-window theme-${savedTheme} ${mobileClass}">
            <div class="tamako-header">
                <div class="tamako-drag-handle">
                    <div class="tamako-title">
                        <span class="tamako-title-icon">${ICONS.store}</span>
                        <span>玉子市场</span>
                    </div>
                </div>
                <div class="tamako-controls">
                    <button class="tamako-btn minimize" title="收起摊位">${ICONS.minimize}</button>
                    <button class="tamako-btn scan" title="扫描消息">${ICONS.search}</button>
                    <button class="tamako-btn delete-mode" title="整理商品">${ICONS.broom}</button>
                    <button class="tamako-btn theme-toggle" title="切换主题">${ICONS.palette}</button>
                    <button class="tamako-btn theme-edit" title="编辑主题">${ICONS.edit}</button>
                    <button class="tamako-btn close" title="打烊">${ICONS.close}</button>
                </div>
            </div>
            <div class="tamako-theme-panel" style="display: none;"><select id="tamako-theme-selector">${themeOptions}</select></div>
            <div class="tamako-tabs">
                <button class="tamako-tab active" data-tab="current">${ICONS.dango}<span>今日特选</span></button>
                <button class="tamako-tab" data-tab="history">${ICONS.box}<span>库存 (<span id="tamako-history-count">0</span>)</span></button>
            </div>
            <div id="tamako-dera-toast" class="tamako-toast"></div>
            <div class="tamako-content" data-content="current">
                <div class="tamako-empty">
                    <span class="icon">🐔</span>
                    <span class="message">${getDeraMessage('empty')}</span>
                </div>
            </div>
            <div class="tamako-content" data-content="history" style="display: none;">
                <div class="tamako-search">
                    ${ICONS.search}
                    <input type="text" id="tamako-search-input" placeholder="搜索商品...">
                    <button class="tamako-search-clear" title="清除" style="display: none;">${ICONS.close}</button>
                </div>
                <div class="tamako-history-list"></div>
            </div>
            <div class="tamako-delete-bar" style="display: none;">
                <label class="tamako-select-all"><input type="checkbox" id="tamako-select-all"><span>全部打包</span></label>
                <div class="tamako-delete-actions">
                    <button class="tamako-delete-confirm">${ICONS.trash}<span>清理选中</span></button>
                    <button class="tamako-delete-cancel">取消</button>
                </div>
            </div>
            <div class="tamako-resize tamako-resize-e" data-dir="e"></div>
            <div class="tamako-resize tamako-resize-s" data-dir="s"></div>
            <div class="tamako-resize tamako-resize-se" data-dir="se"></div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', windowHtml);
    
    const $window = $('#tamako-market-window');
    const defaultPos = getDefaultWindowPosition();
    
    $window.css({
        left: (settings.windowX ?? defaultPos.x) + 'px',
        top: (settings.windowY ?? defaultPos.y) + 'px',
        width: (settings.windowWidth || defaultPos.width) + 'px',
        height: (settings.windowHeight || defaultPos.height) + 'px'
    });
    
    $('#tamako-theme-selector').val(savedTheme);
    currentTheme = savedTheme;
    
    if (savedTheme === 'custom' && settings.customTheme) {
        applyTheme('custom', settings.customTheme);
    } else {
        applyTheme(savedTheme);
    }
    
    initDraggable($window);
    initResizable($window);
    bindWindowEvents($window);
    
    return $window;
}

// ===== 使用 Pointer Events 重写拖拽 =====

function initDraggable($window) {
    const header = $window.find('.tamako-header')[0];
    
    header.addEventListener('contextmenu', e => e.preventDefault());
    
    function onPointerDown(e) {
        if (e.target.closest('.tamako-btn, .tamako-controls')) return;
        
        dragState.isDragging = true;
        dragState.pointerId = e.pointerId;
        
        const rect = $window[0].getBoundingClientRect();
        dragState.offsetX = e.clientX - rect.left;
        dragState.offsetY = e.clientY - rect.top;
        
        header.setPointerCapture(e.pointerId);
        $window.addClass('dragging');
        hideBeautifierFrame($window);
        
        e.preventDefault();
    }
    
    function onPointerMove(e) {
        if (!dragState.isDragging || e.pointerId !== dragState.pointerId) return;
        
        const constrained = constrainPosition(
            e.clientX - dragState.offsetX,
            e.clientY - dragState.offsetY,
            $window[0].offsetWidth,
            $window[0].offsetHeight
        );
        
        $window[0].style.left = constrained.x + 'px';
        $window[0].style.top = constrained.y + 'px';
        
        e.preventDefault();
    }
    
    function onPointerUp(e) {
        if (!dragState.isDragging || e.pointerId !== dragState.pointerId) return;
        
        dragState.isDragging = false;
        
        try {
            header.releasePointerCapture(e.pointerId);
        } catch (err) {}
        
        $window.removeClass('dragging');
        showBeautifierFrame($window);
        
        saveSetting('windowX', parseInt($window.css('left')));
        saveSetting('windowY', parseInt($window.css('top')));
        
        dragState.pointerId = null;
    }
    
    header.addEventListener('pointerdown', onPointerDown);
    header.addEventListener('pointermove', onPointerMove);
    header.addEventListener('pointerup', onPointerUp);
    header.addEventListener('pointercancel', onPointerUp);
}

// ===== 使用 Pointer Events 重写缩放 =====

function initResizable($window) {
    const minWidth = isMobileDevice() ? 260 : 280;
    const minHeight = isMobileDevice() ? 200 : 150;
    
    $window.find('.tamako-resize').each(function() {
        const handle = this;
        
        handle.addEventListener('contextmenu', e => e.preventDefault());
        
        function onPointerDown(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const dir = handle.getAttribute('data-dir');
            const rect = $window[0].getBoundingClientRect();
            
            resizeState = {
                isResizing: true,
                handle: dir,
                startX: e.clientX,
                startY: e.clientY,
                startWidth: rect.width,
                startHeight: rect.height,
                element: handle,
                pointerId: e.pointerId
            };
            
            handle.setPointerCapture(e.pointerId);
            
            hideBeautifierFrame($window);
            $window.addClass('resizing');
            document.body.classList.add('tamako-resizing');
        }
        
        function onPointerMove(e) {
            if (!resizeState.isResizing || e.pointerId !== resizeState.pointerId) return;
            
            e.preventDefault();
            
            const deltaX = e.clientX - resizeState.startX;
            const deltaY = e.clientY - resizeState.startY;
            
            if (resizeState.handle.includes('e') || resizeState.handle === 'se') {
                const newWidth = Math.max(minWidth, resizeState.startWidth + deltaX);
                $window[0].style.width = newWidth + 'px';
            }
            if (resizeState.handle.includes('s') || resizeState.handle === 'se') {
                const newHeight = Math.max(minHeight, resizeState.startHeight + deltaY);
                $window[0].style.height = newHeight + 'px';
            }
        }
        
        function onPointerUp(e) {
            if (!resizeState.isResizing || e.pointerId !== resizeState.pointerId) return;
            
            resizeState.isResizing = false;
            
            try {
                handle.releasePointerCapture(e.pointerId);
            } catch (err) {}
            
            $window.removeClass('resizing');
            document.body.classList.remove('tamako-resizing');
            showBeautifierFrame($window);
            
            saveSetting('windowWidth', $window[0].offsetWidth);
            saveSetting('windowHeight', $window[0].offsetHeight);
            
            resizeState.handle = '';
            resizeState.element = null;
            resizeState.pointerId = null;
        }
        
        handle.addEventListener('pointerdown', onPointerDown);
        handle.addEventListener('pointermove', onPointerMove);
        handle.addEventListener('pointerup', onPointerUp);
        handle.addEventListener('pointercancel', onPointerUp);
    });
}

function bindWindowEvents($window) {
    $window.find('.tamako-btn.close').on('click', () => toggleWindow(false));
    
    $window.find('.tamako-btn.minimize').on('click', function() {
        const isMinimized = $window.toggleClass('minimized').hasClass('minimized');
        $(this).html(isMinimized ? ICONS.expand : ICONS.minimize);
    });
    
    $window.find('.tamako-btn.scan').on('click', function() {
        const $btn = $(this);
        $btn.prop('disabled', true);
        showDeraToast('scanning');
        capturedPlots = [];
        setTimeout(() => {
            const result = scanAllMessages();
            $btn.prop('disabled', false);
            showDeraToast(result.limited ? 'tooMany' : (capturedPlots.length > 0 ? 'found' : 'empty'));
        }, 50);
    });
    
    $window.find('.tamako-btn.theme-toggle').on('click', () => $('.tamako-theme-panel').slideToggle(200));
    $window.find('#tamako-theme-selector').on('change', function() {
        const themeName = this.value;
        if (themeName === 'custom') {
            const settings = getSettings();
            if (settings.customTheme) {
                applyTheme('custom', settings.customTheme);
            } else {
                openThemeEditor();
            }
        } else {
            applyTheme(themeName);
        }
        $('.tamako-theme-panel').slideUp(200);
    });
    $window.find('.tamako-btn.theme-edit').on('click', () => openThemeEditor());
    $window.find('.tamako-btn.delete-mode').on('click', () => toggleDeleteMode());
    $window.find('#tamako-select-all').on('change', function() { $('.tamako-history-item .tamako-checkbox').prop('checked', this.checked); });
    $window.find('.tamako-delete-confirm').on('click', () => deleteSelectedItems());
    $window.find('.tamako-delete-cancel').on('click', () => toggleDeleteMode(false));
    
    $window.find('.tamako-tab').on('click', function() {
        const tab = $(this).data('tab');
        $window.find('.tamako-tab').removeClass('active');
        $(this).addClass('active');
        $window.find('.tamako-content').hide();
        $window.find(`.tamako-content[data-content="${tab}"]`).show();
    });
    
    let searchTimeout = null;
    $window.find('#tamako-search-input').on('input', function() {
        const query = $(this).val().trim();
        $('.tamako-search-clear').toggle(query.length > 0);
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => { searchQuery = query; updateHistoryList(); }, 300);
    });
    
    $window.find('.tamako-search-clear').on('click', function() {
        $('#tamako-search-input').val('');
        searchQuery = '';
        $(this).hide();
        updateHistoryList();
    });
}

function toggleDeleteMode(enable) {
    const $window = $('#tamako-market-window');
    deleteMode = enable ?? !deleteMode;
    $window.find('.tamako-delete-bar').toggle(deleteMode);
    $window.find('.tamako-btn.delete-mode').toggleClass('active', deleteMode);
    $window.find('#tamako-select-all').prop('checked', false);
    if (deleteMode) $window.find('.tamako-tab[data-tab="history"]').click();
    updateHistoryList();
}

function deleteSelectedItems() {
    const toDelete = [];
    $('.tamako-history-item .tamako-checkbox:checked').each(function() {
        toDelete.push(parseInt($(this).closest('.tamako-history-item').data('index')));
    });
    if (toDelete.length === 0) return;
    
    toDelete.sort((a, b) => b - a).forEach(idx => capturedPlots.splice(idx, 1));
    
    if (capturedPlots.length > 0) {
        const latest = capturedPlots[capturedPlots.length - 1];
        updateCurrentContent(latest.content, latest.rawMessage);
    } else {
        updateCurrentContent('', '');
    }
    
    toggleDeleteMode(false);
    updateHistoryList();
    showDeraToast('delete');
}

function createToggleButton() {
    if (document.getElementById('tamako-market-toggle')) return;

    const settings = getSettings();
    const isMobile = isMobileDevice();
    const savedTheme = settings.theme || 'tamako';
    
    const btn = document.createElement('div');
    btn.id = 'tamako-market-toggle';
    btn.className = `tamako-toggle theme-${savedTheme} ${isMobile ? 'tamako-toggle-mobile' : ''}`;
    btn.innerHTML = `<span class="tamako-toggle-icon">${ICONS.store}</span><span class="tamako-toggle-text">玉子市场</span>`;
    btn.title = '拖拽移动 / 点击打开玉子市场';
    document.body.appendChild(btn);
    
    const defaultPos = getDefaultTogglePosition();
    const $btn = $(btn);
    
    $btn.css({ 
        left: (settings.toggleX ?? defaultPos.x) + 'px', 
        top: (settings.toggleY ?? defaultPos.y) + 'px', 
        right: 'auto', 
        bottom: 'auto'
    });
    
    if (savedTheme === 'custom' && settings.customTheme) {
        $btn.css({
            '--theme-primary': settings.customTheme.colors.primary,
            '--theme-secondary': settings.customTheme.colors.secondary
        });
    } else {
        const theme = themes[savedTheme] || themes.tamako;
        $btn.css({
            '--theme-primary': theme.primary,
            '--theme-secondary': theme.secondary
        });
    }
    
    initToggleDraggable($btn);
}

// ===== 使用 Pointer Events 重写按钮拖拽 =====

function initToggleDraggable($toggle) {
    const btn = $toggle[0];
    let hasMoved = false;
    let startX, startY, startTime;
    let offsetX, offsetY;
    let pointerId = null;
    const DRAG_THRESHOLD = 5;
    
    btn.addEventListener('contextmenu', e => e.preventDefault());
    
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
        
        const constrained = constrainPosition(
            e.clientX - offsetX,
            e.clientY - offsetY,
            btn.offsetWidth,
            btn.offsetHeight
        );
        
        $toggle.css({
            left: constrained.x + 'px',
            top: constrained.y + 'px'
        });
        
        e.preventDefault();
    }
    
    function onPointerUp(e) {
        if (e.pointerId !== pointerId) return;
        
        try {
            btn.releasePointerCapture(e.pointerId);
        } catch (err) {}
        
        $toggle.removeClass('dragging');
        
        if (hasMoved) {
            saveSetting('toggleX', parseInt($toggle.css('left')));
            saveSetting('toggleY', parseInt($toggle.css('top')));
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
}

function toggleWindow(show) {
    const $window = $('#tamako-market-window');
    const $button = $('#tamako-market-toggle');
    show = show ?? !$window.hasClass('visible');
    
    if (show) {
        const rect = $window[0].getBoundingClientRect();
        const constrained = constrainPosition(rect.left, rect.top, rect.width, rect.height);
        if (rect.left !== constrained.x || rect.top !== constrained.y) {
            $window.css({ left: constrained.x + 'px', top: constrained.y + 'px' });
        }
    }
    
    $window.toggleClass('visible', show);
    $button.toggleClass('active', show);
    if (!show && deleteMode) toggleDeleteMode(false);
    if (!show && isThemeEditorOpen) closeThemeEditor(false);
}

function updateCurrentContent(content, rawMessage) {
    const $content = $('#tamako-market-window .tamako-content[data-content="current"]');
    const settings = getSettings();
    
    if (!content?.trim()) {
        $content.css('position', '').empty().html(`
            <div class="tamako-empty">
                <span class="icon">🐔</span>
                <span class="message">${getDeraMessage('empty')}</span>
            </div>
        `);
        return;
    }
    
    if (settings.beautifier?.enabled && settings.beautifier?.template) {
        const templateData = parseBeautifierTemplate(settings.beautifier.template);
        if (templateData && rawMessage) {
            if (renderWithBeautifier($content, rawMessage, templateData)) {
                return;
            }
            console.warn('[玉子市场] 美化器渲染失败，使用普通模式');
        }
    }
    
    $content.css('position', '');
    $content.find('.tamako-beautifier-frame, .tamako-beautifier-loading').remove();
    
    let formatted = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (searchQuery) formatted = highlightText(formatted, searchQuery);
    $content.html(`<div class="tamako-plot-content"><div>${formatted.replace(/\n/g, '<br>')}</div></div>`);
}

function filterPlots(plots, query) {
    if (!query) return plots;
    const lowerQuery = query.toLowerCase();
    return plots.filter(p => p.content.toLowerCase().includes(lowerQuery) || extractAMCodes(p.content).join(' ').toLowerCase().includes(lowerQuery));
}

function updateHistoryList() {
    const $list = $('#tamako-market-window .tamako-history-list');
    const filteredPlots = filterPlots(capturedPlots, searchQuery);
    $('#tamako-history-count').text(capturedPlots.length);
    
    if (!capturedPlots.length) {
        $list.html(`<div class="tamako-empty"><span class="icon">📦</span><span class="message">${getDeraMessage('empty')}</span></div>`);
        updateCaptureCount();
        return;
    }
    
    if (filteredPlots.length === 0 && searchQuery) {
        $list.html(`<div class="tamako-empty"><span class="icon">🔍</span><span class="message">${getDeraMessage('noResult')}</span></div>`);
        updateCaptureCount();
        return;
    }
    
    let html = '';
    for (let i = filteredPlots.length - 1; i >= 0; i--) {
        const plot = filteredPlots[i];
        const originalIndex = capturedPlots.indexOf(plot);
        const amDisplay = formatAMCodes(extractAMCodes(plot.content));
        const checkbox = deleteMode ? `<input type="checkbox" class="tamako-checkbox" onclick="event.stopPropagation()">` : '';
        const displayText = searchQuery ? highlightText(amDisplay, searchQuery) : amDisplay;
        
        html += `<div class="tamako-history-item ${deleteMode ? 'delete-mode' : ''}" data-index="${originalIndex}">
            ${checkbox}
            <div class="tamako-item-time">${ICONS.pin} 第${plot.messageIndex}条消息</div>
            <div class="tamako-item-preview">${displayText}</div>
        </div>`;
    }
    
    $list.html(html);
    
    if (!deleteMode) {
        $list.find('.tamako-history-item').on('click', function() {
            const plot = capturedPlots[$(this).data('index')];
            if (plot) {
                updateCurrentContent(plot.content, plot.rawMessage);
                $('#tamako-market-window .tamako-tab[data-tab="current"]').click();
            }
        });
    }
    
    updateCaptureCount();
}

function extractTagContent(message, tagName) {
    const matches = [];
    let match;
    const regex = new RegExp(`(?<!\`)<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>(?!\`)`, 'gi');
    while ((match = regex.exec(message)) !== null) matches.push(match[0]);
    return matches;
}

function extractPlotContent(message) {
    if (!message || !extensionEnabled || !getSettings().autoCapture) return null;
    const tags = getSettings().captureTags || [];
    if (tags.length === 0) return null;
    const keywords = ['以上是用户的本轮输入', '以上是用户本轮输入', '以上是用户的', '以下是用户的本轮输入', '以下是用户本轮输入', '以下是用户的'];
    if (!keywords.some(k => message.includes(k))) return null;
    const parts = [];
    for (const tag of tags) parts.push(...extractTagContent(message, tag.trim()));
    if (parts.length === 0) return null;
    return { content: parts.join('\n\n'), rawMessage: message };
}

function handleUserMessage(messageIndex) {
    if (!extensionEnabled || !getSettings().autoCapture) return false;
    try {
        const context = SillyTavern.getContext();
        if (!context?.chat || messageIndex < 0 || messageIndex >= context.chat.length) return false;
        const message = context.chat[messageIndex];
        if (!message?.is_user || !message.mes || capturedPlots.some(p => p.messageIndex === messageIndex)) return false;
        
        const extracted = extractPlotContent(message.mes);
        if (!extracted) return false;
        
        const settings = getSettings();
        capturedPlots.push({ content: extracted.content, rawMessage: extracted.rawMessage, timestamp: Date.now(), messageIndex });
        if (capturedPlots.length > settings.maxStoredPlots) capturedPlots = capturedPlots.slice(-settings.maxStoredPlots);
        capturedPlots.sort((a, b) => a.messageIndex - b.messageIndex);
        
        updateCurrentContent(extracted.content, extracted.rawMessage);
        updateHistoryList();
        showDeraToast('newItem');
        
        if (!$('#tamako-market-window').hasClass('visible')) {
            $('#tamako-market-toggle').addClass('has-new');
            setTimeout(() => $('#tamako-market-toggle').removeClass('has-new'), 3000);
        }
        return true;
    } catch (e) {
        console.error('[玉子市场] 处理消息错误:', e);
        return false;
    }
}

function checkLatestUserMessage() {
    if (!extensionEnabled || !getSettings().autoCapture) return;
    try {
        const context = SillyTavern.getContext();
        if (!context?.chat) return;
        for (let i = context.chat.length - 1; i >= 0; i--) {
            if (context.chat[i]?.is_user) {
                if (!capturedPlots.some(p => p.messageIndex === i)) handleUserMessage(i);
                break;
            }
        }
    } catch (e) { console.error('[玉子市场] 检查最新消息错误:', e); }
}

function scanAllMessages() {
    const result = { limited: false, count: 0 };
    if (!extensionEnabled) return result;
    
    try {
        const context = SillyTavern.getContext();
        if (!context?.chat?.length) return result;
        
        const settings = getSettings();
        const maxScan = settings.maxScanMessages || 50;
        const maxStore = settings.maxStoredPlots || 50;
        let latestExtracted = null, scannedCount = 0, foundCount = 0;
        
        for (let i = context.chat.length - 1; i >= 0 && scannedCount < maxScan; i--) {
            if (!context.chat[i]?.is_user) continue;
            scannedCount++;
            
            const extracted = extractPlotContent(context.chat[i].mes);
            if (!extracted || capturedPlots.some(p => p.messageIndex === i)) continue;
            
            capturedPlots.push({ content: extracted.content, rawMessage: extracted.rawMessage, timestamp: Date.now() - (context.chat.length - i) * 1000, messageIndex: i });
            foundCount++;
            if (!latestExtracted) latestExtracted = extracted;
        }
        
        if (scannedCount >= maxScan) {
            for (let i = context.chat.length - scannedCount - 1; i >= 0; i--) {
                if (context.chat[i]?.is_user) { result.limited = true; break; }
            }
        }
        
        capturedPlots.sort((a, b) => a.messageIndex - b.messageIndex);
        if (capturedPlots.length > maxStore) capturedPlots = capturedPlots.slice(-maxStore);
        if (latestExtracted) updateCurrentContent(latestExtracted.content, latestExtracted.rawMessage);
        updateHistoryList();
        result.count = foundCount;
    } catch (e) { console.error('[玉子市场] 扫描错误:', e); }
    
    return result;
}

function setExtensionEnabled(enabled) {
    extensionEnabled = enabled;
    saveSetting('enabled', enabled);
    const $button = $('#tamako-market-toggle');
    if (enabled) $button.show();
    else { $button.hide(); $('#tamako-market-window').removeClass('visible'); }
}

function updateTemplateDisplay() {
    const settings = getSettings();
    const $savedItem = $('#tamako-saved-template');
    const $pendingItem = $('#tamako-pending-template');
    
    if (settings.beautifier?.fileName) {
        $savedItem.show().addClass('has-file');
        $savedItem.find('.tamako-template-name').text(settings.beautifier.fileName);
    } else {
        $savedItem.hide().removeClass('has-file');
    }
    
    const pendingName = $pendingItem.data('fileName');
    if (pendingName) {
        $pendingItem.show().addClass('pending');
        $pendingItem.find('.tamako-template-name').text(pendingName);
    } else {
        $pendingItem.hide().removeClass('pending');
    }
}

function createSettingsPanel() {
    if (document.getElementById('tamako-market-settings')) return;
    const container = document.getElementById('extensions_settings');
    if (!container) return;

    const settings = getSettings();
    extensionEnabled = settings.enabled !== false;
    
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
                            <input type="checkbox" id="tamako-enabled" ${extensionEnabled ? 'checked' : ''}>
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
                            <div class="tamako-settings-section-title">今日特选美化器</div>
                            <label class="checkbox_label">
                                <input type="checkbox" id="tamako-beautifier-enabled" ${settings.beautifier?.enabled ? 'checked' : ''}>
                                <span>启用美化器</span>
                            </label>
                            
                            <div class="tamako-file-drop" id="tamako-file-drop">
                                <div class="tamako-file-drop-text">点击上传或拖拽文件<br>支持 .html / .json / .txt</div>
                            </div>
                            <input type="file" class="tamako-file-input" id="tamako-file-input" accept=".html,.json,.txt,.htm">
                            
                            <div class="tamako-template-item" id="tamako-saved-template" style="display: none;">
                                <span class="tamako-template-label">当前模板:</span>
                                <span class="tamako-template-name"></span>
                                <button class="tamako-template-clear" id="tamako-clear-saved" title="删除">×</button>
                            </div>
                            
                            <div class="tamako-template-item" id="tamako-pending-template" style="display: none;">
                                <span class="tamako-template-label">待保存:</span>
                                <span class="tamako-template-name"></span>
                                <button class="tamako-template-clear" id="tamako-clear-pending" title="取消">×</button>
                            </div>
                            
                            <div class="tamako-file-status" id="tamako-file-status"></div>
                            
                            <div class="tamako-btn-group">
                                <button id="tamako-beautifier-save" class="menu_button">保存</button>
                                <button id="tamako-beautifier-test" class="menu_button">测试</button>
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
    
    $('#tamako-enabled').on('change', function() { setExtensionEnabled(this.checked); });
    $('#tamako-auto-capture').on('change', function() { saveSetting('autoCapture', this.checked); });
    
    let tagsTimeout = null;
    $('#tamako-capture-tags').on('input', function() {
        clearTimeout(tagsTimeout);
        tagsTimeout = setTimeout(() => saveSetting('captureTags', this.value.split(',').map(t => t.trim()).filter(t => t)), 500);
    });
    
    $('#tamako-max-scan').on('change', function() { 
        this.value = Math.max(10, Math.min(500, parseInt(this.value) || 50)); 
        saveSetting('maxScanMessages', parseInt(this.value)); 
    });
    $('#tamako-max-store').on('change', function() { 
        this.value = Math.max(10, Math.min(200, parseInt(this.value) || 50)); 
        saveSetting('maxStoredPlots', parseInt(this.value)); 
    });
    
    const $fileDrop = $('#tamako-file-drop');
    const $fileInput = $('#tamako-file-input');
    const $fileStatus = $('#tamako-file-status');
    const $pendingItem = $('#tamako-pending-template');
    
    let pendingTemplate = null;
    
    function handleFile(file) {
        if (!file) return;
        const validExtensions = ['.html', '.htm', '.json', '.txt'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!validExtensions.includes(ext)) {
            $fileStatus.removeClass('success').addClass('error').text('不支持的文件类型');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            clearTemplateCache();
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
            pendingTemplate = content;
            $pendingItem.data('fileName', file.name);
            updateTemplateDisplay();
            $fileStatus.removeClass('error').addClass('success').text('文件已加载，点击保存生效');
        };
        reader.onerror = function() {
            $fileStatus.removeClass('success').addClass('error').text('文件读取失败');
        };
        reader.readAsText(file);
    }
    
    $fileDrop.on('click', () => $fileInput.click());
    $fileDrop.on('dragover', function(e) { e.preventDefault(); $(this).addClass('dragover'); });
    $fileDrop.on('dragleave drop', function(e) { e.preventDefault(); $(this).removeClass('dragover'); });
    $fileDrop.on('drop', function(e) { e.preventDefault(); if (e.originalEvent.dataTransfer.files.length > 0) handleFile(e.originalEvent.dataTransfer.files[0]); });
    $fileInput.on('change', function() { if (this.files.length > 0) handleFile(this.files[0]); });
    
    $('#tamako-beautifier-enabled').on('change', function() {
        const s = getSettings();
        s.beautifier.enabled = this.checked;
        saveSetting('beautifier', s.beautifier);
        clearTemplateCache();
        if (capturedPlots.length > 0) {
            const latest = capturedPlots[capturedPlots.length - 1];
            updateCurrentContent(latest.content, latest.rawMessage);
        }
        $fileStatus.removeClass('error success').text(this.checked ? '已启用' : '已禁用');
    });
    
    $('#tamako-clear-saved').on('click', function(e) {
        e.stopPropagation();
        clearTemplateCache();
        const s = getSettings();
        s.beautifier.template = '';
        s.beautifier.fileName = '';
        saveSetting('beautifier', s.beautifier);
        updateTemplateDisplay();
        $fileStatus.removeClass('error success').text('已清空');
        if (capturedPlots.length > 0) {
            const latest = capturedPlots[capturedPlots.length - 1];
            updateCurrentContent(latest.content, latest.rawMessage);
        }
    });
    
    $('#tamako-clear-pending').on('click', function(e) {
        e.stopPropagation();
        pendingTemplate = null;
        $pendingItem.data('fileName', '');
        updateTemplateDisplay();
        $fileInput.val('');
        $fileStatus.removeClass('error success').text('已取消');
    });
    
    $('#tamako-beautifier-save').on('click', function() {
        if (!pendingTemplate) {
            const s = getSettings();
            if (s.beautifier?.template) {
                $fileStatus.removeClass('error').addClass('success').text('模板已是最新');
            } else {
                $fileStatus.removeClass('success').addClass('error').text('请先上传模板文件');
            }
            return;
        }
        const s = getSettings();
        const fileName = $pendingItem.data('fileName') || '未命名模板';
        s.beautifier.template = pendingTemplate;
        s.beautifier.fileName = fileName;
        saveSetting('beautifier', s.beautifier);
        pendingTemplate = null;
        $pendingItem.data('fileName', '');
        updateTemplateDisplay();
        $fileInput.val('');
        $fileStatus.removeClass('error').addClass('success').text('已保存');
        if (s.beautifier.enabled && capturedPlots.length > 0) {
            const latest = capturedPlots[capturedPlots.length - 1];
            updateCurrentContent(latest.content, latest.rawMessage);
        }
    });
    
    $('#tamako-beautifier-test').on('click', function() {
        const templateToTest = pendingTemplate || getSettings().beautifier?.template;
        if (!templateToTest) {
            $fileStatus.removeClass('success').addClass('error').text('请先上传模板文件');
            return;
        }
        clearTemplateCache();
        const parsed = parseBeautifierTemplate(templateToTest);
        if (!parsed) {
            $fileStatus.removeClass('success').addClass('error').text('模板格式无效');
            return;
        }
        const validation = validateTemplate(parsed);
        if (!validation.valid) {
            $fileStatus.removeClass('success').addClass('error').text(validation.error);
            return;
        }
        const testMsg = capturedPlots.length > 0 
            ? capturedPlots[capturedPlots.length - 1].rawMessage 
            : `以上是用户的本轮输入
<prologue># 第一幕：初遇
**【本幕概要】** 测试场景</prologue>
<recall>AM0001, AM0002</recall>
<scene_direction><timestamp>Day 1, 14:30 (+2小时)</timestamp>测试场景描述</scene_direction>
<content><file><review npc="测试NPC">[阿尔] "这是测试对话"
[爱德华] "这也是测试对话"</review></file></content>`;
        
        const $content = $('#tamako-market-window .tamako-content[data-content="current"]');
        if (renderWithBeautifier($content, testMsg, parsed)) {
            $fileStatus.removeClass('error').addClass('success').text('测试成功');
            toggleWindow(true);
            $('#tamako-market-window .tamako-tab[data-tab="current"]').click();
        } else {
            $fileStatus.removeClass('success').addClass('error').text('渲染失败');
        }
    });
    
    $('#tamako-open-btn').on('click', () => { 
        if (!extensionEnabled) { setExtensionEnabled(true); $('#tamako-enabled').prop('checked', true); } 
        toggleWindow(true); 
    });
    $('#tamako-reset-btn').on('click', () => resetWindowPosition());
    $('#tamako-reset-toggle-btn').on('click', () => resetTogglePosition());
    
    updateTemplateDisplay();
    if (!extensionEnabled) $('#tamako-market-toggle').hide();
}

function updateCaptureCount() {
    $('#tamako-count').text(capturedPlots.length);
    $('#tamako-history-count').text(capturedPlots.length);
}

function setupMutationObserver() {
    try {
        const chatContainer = document.getElementById('chat');
        if (!chatContainer) { setTimeout(setupMutationObserver, 1000); return; }
        
        let addDebounceTimer = null;
        let removeDebounceTimer = null;
        
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
                addDebounceTimer = setTimeout(() => checkLatestUserMessage(), 500);
            }
            if (hasRemoved) {
                if (removeDebounceTimer) clearTimeout(removeDebounceTimer);
                removeDebounceTimer = setTimeout(() => validateCapturedPlots(), 300);
            }
        });
        
        observer.observe(chatContainer, { childList: true, subtree: true });
    } catch (e) { console.error('[玉子市场] DOM监听失败:', e); }
}

function initEventListeners() {
    try {
        const context = SillyTavern.getContext();
        if (context?.eventSource) {
            context.eventSource.on('MESSAGE_SENT', (idx) => setTimeout(() => handleUserMessage(idx), 300));
            context.eventSource.on('MESSAGE_RENDERED', (idx) => {
                if (SillyTavern.getContext()?.chat?.[idx]?.is_user) setTimeout(() => handleUserMessage(idx), 200);
            });
            context.eventSource.on('CHAT_CHANGED', () => { capturedPlots = []; setTimeout(() => scanAllMessages(), 500); });
            context.eventSource.on('GENERATION_STARTED', () => setTimeout(() => checkLatestUserMessage(), 300));
            context.eventSource.on('GENERATION_ENDED', () => setTimeout(() => checkLatestUserMessage(), 300));
            
            const deleteEvents = ['MESSAGE_DELETED', 'MESSAGE_REMOVED', 'CHAT_UPDATED', 'MESSAGE_EDITED', 'MESSAGE_SWIPED'];
            for (const eventName of deleteEvents) {
                try { context.eventSource.on(eventName, () => validateCapturedPlots()); } catch (e) {}
            }
        }
        setupMutationObserver();
    } catch (e) { console.error('[玉子市场] 事件监听失败:', e); setupMutationObserver(); }
}

(function init() {
    const onReady = () => {
        try {
            createWindow();
            createToggleButton();
            setTimeout(createSettingsPanel, 2000);
            initEventListeners();
            setTimeout(() => scanAllMessages(), 1000);
            console.log('[玉子市场] 开店啦！v2.5.3');
        } catch (e) { console.error('[玉子市场] 初始化错误:', e); }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady);
    else setTimeout(onReady, 100);
})();
