// modules/utils.js
/**
 * 玉子市场 - 工具函数
 * @version 2.6.0
 */

import { extensionName, defaultSettings, themes, fontOptions, deraMessages } from './constants.js';
import { currentTheme } from './state.js';

// ===== 设备检测 =====

export function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || window.innerWidth <= 768 
        || ('ontouchstart' in window);
}

// ===== 设置管理 =====

export function getSettings() {
    try {
        const context = SillyTavern.getContext();
        if (context?.extensionSettings) {
            if (!context.extensionSettings[extensionName]) {
                context.extensionSettings[extensionName] = { ...defaultSettings };
            }
            const s = context.extensionSettings[extensionName];
            if (!s.captureTags) s.captureTags = [...defaultSettings.captureTags];
            if (!s.maxScanMessages) s.maxScanMessages = defaultSettings.maxScanMessages;
            if (!s.maxStoredPlots) s.maxStoredPlots = defaultSettings.maxStoredPlots;
            
            // 迁移旧版美化器设置
            if (!s.beautifier || s.beautifier.template !== undefined) {
                s.beautifier = migrateBeautifierSettings(s.beautifier);
            }
            if (!s.beautifier.templates) s.beautifier.templates = [];
            if (s.beautifier.activeTemplateId === undefined) s.beautifier.activeTemplateId = null;
            
            if (s.customTheme === undefined) s.customTheme = null;
            return s;
        }
    } catch (e) {
        console.warn('[玉子市场] 无法获取设置:', e);
    }
    return { ...defaultSettings };
}

// 迁移旧版单模板设置到新版多模板结构
function migrateBeautifierSettings(oldBeautifier) {
    const newBeautifier = {
        enabled: false,
        activeTemplateId: null,
        templates: []
    };
    
    if (oldBeautifier) {
        newBeautifier.enabled = oldBeautifier.enabled || false;
        
        // 如果有旧模板，迁移到新结构
        if (oldBeautifier.template && oldBeautifier.template.trim()) {
            const migratedTemplate = {
                id: generateTemplateId(),
                name: oldBeautifier.fileName || '迁移的模板',
                template: oldBeautifier.template,
                createdAt: Date.now()
            };
            newBeautifier.templates.push(migratedTemplate);
            newBeautifier.activeTemplateId = migratedTemplate.id;
        }
    }
    
    return newBeautifier;
}

export function saveSetting(key, value) {
    try {
        const settings = getSettings();
        settings[key] = value;
        SillyTavern.getContext()?.saveSettingsDebounced?.();
    } catch (e) {
        console.warn('[玉子市场] 保存失败:', e);
    }
}

// ===== 模板管理辅助函数 =====

export function generateTemplateId() {
    return 'tpl_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
}

export function getActiveTemplate() {
    const settings = getSettings();
    if (!settings.beautifier?.activeTemplateId || !settings.beautifier?.templates) {
        return null;
    }
    return settings.beautifier.templates.find(t => t.id === settings.beautifier.activeTemplateId) || null;
}

export function getTemplateById(templateId) {
    const settings = getSettings();
    if (!settings.beautifier?.templates) return null;
    return settings.beautifier.templates.find(t => t.id === templateId) || null;
}

// ===== 颜色处理 =====

export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

export function rgbToHsl(r, g, b) {
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

export function hslToRgb(h, s, l) {
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

export function parseColor(color) {
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

// ===== 位置计算 =====

export function getDefaultWindowPosition() {
    const isMobile = isMobileDevice();
    const width = isMobile ? Math.min(340, window.innerWidth - 20) : defaultSettings.windowWidth;
    const height = isMobile ? Math.min(400, window.innerHeight - 100) : defaultSettings.windowHeight;
    return {
        x: Math.max(10, Math.floor((window.innerWidth - width) / 2)),
        y: Math.max(60, Math.floor((window.innerHeight - height) / 2) - 50),
        width,
        height
    };
}

export function getDefaultTogglePosition() {
    const isMobile = isMobileDevice();
    return isMobile 
        ? { x: Math.max(10, window.innerWidth - 130), y: Math.max(10, window.innerHeight - 160) } 
        : { x: Math.max(10, window.innerWidth - 330), y: 10 };
}

export function constrainPosition(x, y, width, height) {
    return {
        x: Math.max(0, Math.min(x, Math.max(0, window.innerWidth - width))),
        y: Math.max(0, Math.min(y, Math.max(0, window.innerHeight - height)))
    };
}

// ===== 主题相关 =====

export function getCurrentThemeData() {
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

export function applyThemeStyles(themeData, $window, $toggle) {
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

// ===== 辅助函数 =====

export function getDeraMessage(type) {
    const messages = deraMessages[type] || deraMessages.empty;
    return messages[Math.floor(Math.random() * messages.length)];
}

export function highlightText(text, query) {
    if (!query) return text;
    return text.replace(
        new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), 
        '<mark>$1</mark>'
    );
}

export function extractAMCodes(content) {
    const matches = content.match(/AM\d{4}/gi);
    return matches ? [...new Set(matches.map(m => m.toUpperCase()))] : [];
}

export function formatAMCodes(codes) {
    if (codes.length === 0) return '暂时没有商品入库哦~';
    if (codes.length <= 3) return codes.join(', ');
    return `${codes.slice(0, 3).join(', ')} 等${codes.length}件`;
}

export function showDeraToast(type) {
    const $toast = $('#tamako-dera-toast');
    $toast.text(getDeraMessage(type)).addClass('show');
    setTimeout(() => $toast.removeClass('show'), 2000);
}

// ===== iframe 辅助 =====

export function hideBeautifierFrame($window) {
    const iframe = $window.find('.tamako-beautifier-frame')[0];
    if (iframe) iframe.style.visibility = 'hidden';
}

export function showBeautifierFrame($window) {
    const iframe = $window.find('.tamako-beautifier-frame')[0];
    if (iframe) iframe.style.visibility = 'visible';
}
