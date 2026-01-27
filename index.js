/* index.js */
/**
 * 玉子市场 - SillyTavern 悬浮窗扩展
 * @version 2.4.2
 * 功能：捕获XML标签内容、自定义美化器、消息删除检测、移动端适配
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
};

const themes = {
    tamako: { name: '玉子市场', primary: '#FFB6C1', secondary: '#DDA0DD' },
    ocean: { name: '海边小店', primary: '#87CEEB', secondary: '#5F9EA0' },
    sunflower: { name: '向日葵田', primary: '#FFD700', secondary: '#FFA500' },
    night: { name: '夜间模式', primary: '#9370DB', secondary: '#6A5ACD' },
};

const deraMessages = {
    empty: ['德拉在打瞌睡...', '店里空空的，德拉好无聊~', '德拉等着新货到来！'],
    newItem: ['德拉发现了新货！', '有新商品入库啦！', '德拉：这个看起来不错哦~'],
    scanning: ['德拉正在努力搜寻...', '等等，德拉在找东西~', '德拉的雷达启动中...'],
    found: ['德拉找到了好多东西！', '搜寻完毕！德拉很棒吧~', '库存已更新，德拉辛苦了！'],
    delete: ['德拉帮你打包好了~', '清理完毕！店铺更整洁了~', '德拉：这些就交给我处理吧！'],
    noResult: ['德拉找不到这个呢...', '没有匹配的商品哦~', '德拉翻遍了也没找到~'],
    tooMany: ['商品太多了，德拉只拿了一部分~', '库存爆满！德拉尽力了~'],
};

let capturedPlots = [];
let deleteMode = false;
let extensionEnabled = true;
let searchQuery = '';
let currentTheme = 'tamako';
let cachedTemplate = null;
let cachedTemplateSource = '';

let resizeState = {
    isResizing: false,
    handle: '',
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0
};

let validateDebounceTimer = null;

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

function applyTheme(themeName) {
    const theme = themes[themeName] || themes.tamako;
    currentTheme = themeName;
    const $window = $('#tamako-market-window');
    const $toggle = $('#tamako-market-toggle');
    $window.removeClass('theme-tamako theme-ocean theme-sunflower theme-night').addClass(`theme-${themeName}`);
    $toggle.removeClass('theme-tamako theme-ocean theme-sunflower theme-night').addClass(`theme-${themeName}`);
    $window.css({ '--theme-primary': theme.primary, '--theme-secondary': theme.secondary });
    $toggle.css({ '--theme-primary': theme.primary, '--theme-secondary': theme.secondary });
    saveSetting('theme', themeName);
    $('#tamako-theme-selector').val(themeName);
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

function getEventPosition(e) {
    if (e.touches?.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches?.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
}

function constrainPosition(x, y, width, height) {
    return {
        x: Math.max(0, Math.min(x, Math.max(0, window.innerWidth - width))),
        y: Math.max(0, Math.min(y, Math.max(0, window.innerHeight - height)))
    };
}

// ========== 美化器 iframe 控制 ==========

function hideBeautifierFrame($window) {
    const iframe = $window.find('.tamako-beautifier-frame')[0];
    if (iframe) iframe.style.visibility = 'hidden';
}

function showBeautifierFrame($window) {
    const iframe = $window.find('.tamako-beautifier-frame')[0];
    if (iframe) iframe.style.visibility = 'visible';
}

// ========== 消息验证 ==========

function validateCapturedPlots() {
    if (!extensionEnabled) return;
    
    if (validateDebounceTimer) clearTimeout(validateDebounceTimer);
    validateDebounceTimer = setTimeout(() => {
        doValidateCapturedPlots();
    }, 300);
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
            if (!msg || !msg.is_user) return false;
            if (!msg.mes) return false;
            
            const tags = getSettings().captureTags || [];
            for (const tag of tags) {
                if (plot.content.includes(`<${tag}`) && msg.mes.includes(`<${tag}`)) {
                    return true;
                }
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
            if (capturedPlots.length > maxStore) {
                capturedPlots = capturedPlots.slice(-maxStore);
            }
            
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

// ========== 美化器 ==========

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
    }
    
    return cachedTemplate;
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
        
        data.chat = context.chat.map((msg, idx) => {
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
    
    const regex = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'i');
    
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
            
            const contentPattern = /<content(?:\s[^>]*)?>([\\s\\S]*?)<\/content>/gi;
            let contentMatch;
            while ((contentMatch = contentPattern.exec(src)) !== null) {
                const contentInner = contentMatch[1];
                const fileMatch = contentInner.match(/<file(?:\s[^>]*)?>([\\s\\S]*?)<\/file>/i);
                if (fileMatch && fileMatch[1]) {
                    return fileMatch[1].trim();
                }
            }
        }
    }
    
    return '';
}

function injectDataIntoTemplate(html, rawMessage, fullChatData) {
    const escapeForJS = (str) => {
        if (!str) return '';
        return str
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
            .replace(/</g, '\\x3c')
            .replace(/>/g, '\\x3e');
    };
    
    let chatJSON = '[]';
    try {
        chatJSON = JSON.stringify(fullChatData.chat || []);
        chatJSON = chatJSON.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    } catch (e) {
        console.error('[玉子市场] 序列化聊天数据失败:', e);
    }
    
    const injectionScript = `
<script>
window.TAMAKO_CHAT_DATA = JSON.parse('${chatJSON}');
window.TAMAKO_TAGS = {
    stage: "${escapeForJS(fullChatData.tags?.stage || '')}",
    recall: "${escapeForJS(fullChatData.tags?.recall || '')}",
    prologue: "${escapeForJS(fullChatData.tags?.prologue || '')}",
    plot: "${escapeForJS(fullChatData.tags?.plot || '')}",
    cast: "${escapeForJS(fullChatData.tags?.cast || '')}",
    scene_direction: "${escapeForJS(fullChatData.tags?.scene_direction || '')}",
    content: "${escapeForJS(fullChatData.tags?.content || '')}",
    file: "${escapeForJS(fullChatData.tags?.file || '')}",
    contentFile: "${escapeForJS(fullChatData.tags?.contentFile || '')}"
};
window.TAMAKO_RAW_MESSAGE = "${escapeForJS(rawMessage)}";

window.getContext = function() { return { chat: window.TAMAKO_CHAT_DATA }; };
window.SillyTavern = { chat: window.TAMAKO_CHAT_DATA, getContext: window.getContext };
window.getSTChat = function() { return window.TAMAKO_CHAT_DATA; };

window.extractTagFromChat = function(tagName) {
    var key = tagName.toLowerCase();
    if (window.TAMAKO_TAGS[key] !== undefined) return window.TAMAKO_TAGS[key];
    return window._extractTagFromChatFallback(tagName);
};

window._extractTagFromChatFallback = function(tagName) {
    try {
        var chat = window.TAMAKO_CHAT_DATA;
        if (!chat || !chat.length) return "";
        var regex = new RegExp("<" + tagName + "(?:\\\\s[^>]*)?>([\\\\s\\\\S]*?)<\\\\/" + tagName + ">", "i");
        for (var i = chat.length - 1; i >= 0; i--) {
            var msg = chat[i];
            if (!msg) continue;
            var sources = [msg.extra && msg.extra.qrf_plot, msg.mes, msg.qrf_plot];
            if (msg.swipes) {
                for (var s = 0; s < msg.swipes.length; s++) {
                    var swipe = msg.swipes[s];
                    if (typeof swipe === "string") sources.push(swipe);
                    else if (swipe && swipe.extra && swipe.extra.qrf_plot) sources.push(swipe.extra.qrf_plot);
                }
            }
            for (var j = 0; j < sources.length; j++) {
                if (!sources[j]) continue;
                var match = sources[j].match(regex);
                if (match && match[1]) return match[1].trim();
            }
        }
    } catch (e) {}
    return "";
};

window.extractFileFromContent = function() {
    if (window.TAMAKO_TAGS.contentFile) return window.TAMAKO_TAGS.contentFile;
    try {
        var chat = window.TAMAKO_CHAT_DATA;
        if (!chat || !chat.length) return "";
        for (var i = chat.length - 1; i >= 0; i--) {
            var msg = chat[i];
            if (!msg) continue;
            var sources = [msg.extra && msg.extra.qrf_plot, msg.mes, msg.qrf_plot];
            if (msg.swipes) {
                for (var s = 0; s < msg.swipes.length; s++) {
                    var swipe = msg.swipes[s];
                    if (typeof swipe === "string") sources.push(swipe);
                    else if (swipe && swipe.extra && swipe.extra.qrf_plot) sources.push(swipe.extra.qrf_plot);
                }
            }
            for (var j = 0; j < sources.length; j++) {
                if (!sources[j]) continue;
                var contentMatches = sources[j].match(/<content(?:\\s[^>]*)?>([\\s\\S]*?)<\\/content>/gi);
                if (contentMatches) {
                    for (var k = 0; k < contentMatches.length; k++) {
                        var fileMatch = contentMatches[k].match(/<file(?:\\s[^>]*)?>([\\s\\S]*?)<\\/file>/i);
                        if (fileMatch && fileMatch[1]) return fileMatch[1].trim();
                    }
                }
            }
        }
    } catch (e) {}
    return "";
};

console.log('[玉子市场] 数据注入完成');
</script>
`;
    
    let modifiedHtml = html;
    if (html.includes('</head>')) {
        modifiedHtml = html.replace('</head>', injectionScript + '</head>');
    } else if (html.includes('<body')) {
        modifiedHtml = html.replace('<body', injectionScript + '<body');
    } else {
        modifiedHtml = injectionScript + html;
    }
    
    return modifiedHtml;
}

function renderWithBeautifier($container, rawMessage, templateData) {
    try {
        let html = templateData.html;
        
        if (html.includes('$1')) {
            html = html.replace(/\$1/g, rawMessage);
        }
        
        const fullChatData = extractAllChatData();
        html = injectDataIntoTemplate(html, rawMessage, fullChatData);
        
        let iframe = $container.find('.tamako-beautifier-frame')[0];
        
        if (!iframe) {
            $container.html(`<iframe class="tamako-beautifier-frame" frameborder="0" style="width:100%;height:100%;border:none;"></iframe>`);
            iframe = $container.find('.tamako-beautifier-frame')[0];
        }
        
        if (!iframe) return false;
        iframe.srcdoc = html;
        return true;
    } catch (e) {
        console.error('[玉子市场] 美化器渲染失败:', e);
        return false;
    }
}

function clearTemplateCache() { cachedTemplate = null; cachedTemplateSource = ''; }

// ========== 窗口相关代码 ==========

function createWindow() {
    if (document.getElementById('tamako-market-window')) return $('#tamako-market-window');

    const themeOptions = Object.entries(themes).map(([key, theme]) => 
        `<option value="${key}">${theme.name}</option>`
    ).join('');
    const mobileClass = isMobileDevice() ? 'tamako-mobile' : '';

    const windowHtml = `
        <div id="tamako-market-window" class="tamako-window theme-tamako ${mobileClass}">
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
    const settings = getSettings();
    const defaultPos = getDefaultWindowPosition();
    
    $window.css({
        left: (settings.windowX ?? defaultPos.x) + 'px',
        top: (settings.windowY ?? defaultPos.y) + 'px',
        width: (settings.windowWidth || defaultPos.width) + 'px',
        height: (settings.windowHeight || defaultPos.height) + 'px',
    });
    
    initDraggable($window);
    initResizable($window);
    bindWindowEvents($window);
    applyTheme(settings.theme || 'tamako');
    
    return $window;
}

function initDraggable($window) {
    const header = $window.find('.tamako-header')[0];
    let isDragging = false;
    let offsetX, offsetY;
    
    header.addEventListener('contextmenu', e => e.preventDefault());
    
    function startDrag(e) {
        if (e.target.closest('.tamako-btn, .tamako-controls')) return;
        isDragging = true;
        const pos = getEventPosition(e);
        const rect = $window[0].getBoundingClientRect();
        offsetX = pos.x - rect.left;
        offsetY = pos.y - rect.top;
        $window.addClass('dragging');
        
        hideBeautifierFrame($window);
        
        e.preventDefault();
    }
    
    function moveDrag(e) {
        if (!isDragging) return;
        const pos = getEventPosition(e);
        const constrained = constrainPosition(pos.x - offsetX, pos.y - offsetY, $window[0].offsetWidth, $window[0].offsetHeight);
        $window[0].style.left = constrained.x + 'px';
        $window[0].style.top = constrained.y + 'px';
        e.preventDefault();
    }
    
    function endDrag() {
        if (isDragging) {
            isDragging = false;
            $window.removeClass('dragging');
            
            showBeautifierFrame($window);
            
            saveSetting('windowX', parseInt($window.css('left')));
            saveSetting('windowY', parseInt($window.css('top')));
        }
    }
    
    header.addEventListener('mousedown', startDrag);
    header.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);
}

function initResizable($window) {
    const minWidth = isMobileDevice() ? 260 : 280;
    const minHeight = isMobileDevice() ? 200 : 150;
    
    $window.find('.tamako-resize').each(function() {
        this.addEventListener('contextmenu', e => e.preventDefault());
    });
    
    function startResize(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dir = this.getAttribute('data-dir');
        const pos = getEventPosition(e);
        const rect = $window[0].getBoundingClientRect();
        
        resizeState = {
            isResizing: true,
            handle: dir,
            startX: pos.x,
            startY: pos.y,
            startWidth: rect.width,
            startHeight: rect.height
        };
        
        hideBeautifierFrame($window);
        
        $window.addClass('resizing');
        document.body.style.cursor = dir === 'se' ? 'nwse-resize' : (dir === 's' ? 'ns-resize' : 'ew-resize');
        document.body.style.userSelect = 'none';
    }
    
    function moveResize(e) {
        if (!resizeState.isResizing) return;
        
        e.preventDefault();
        const pos = getEventPosition(e);
        const deltaX = pos.x - resizeState.startX;
        const deltaY = pos.y - resizeState.startY;
        
        if (resizeState.handle.includes('e') || resizeState.handle === 'se') {
            $window[0].style.width = Math.max(minWidth, resizeState.startWidth + deltaX) + 'px';
        }
        if (resizeState.handle.includes('s') || resizeState.handle === 'se') {
            $window[0].style.height = Math.max(minHeight, resizeState.startHeight + deltaY) + 'px';
        }
    }
    
    function endResize() {
        if (!resizeState.isResizing) return;
        
        resizeState.isResizing = false;
        resizeState.handle = '';
        
        $window.removeClass('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        showBeautifierFrame($window);
        
        saveSetting('windowWidth', $window[0].offsetWidth);
        saveSetting('windowHeight', $window[0].offsetHeight);
    }
    
    $window.find('.tamako-resize').each(function() {
        this.addEventListener('mousedown', startResize);
        this.addEventListener('touchstart', startResize, { passive: false });
    });
    
    document.addEventListener('mousemove', moveResize, true);
    document.addEventListener('touchmove', moveResize, { passive: false, capture: true });
    document.addEventListener('mouseup', endResize, true);
    document.addEventListener('touchend', endResize, true);
    document.addEventListener('touchcancel', endResize, true);
    document.addEventListener('mouseleave', endResize);
    window.addEventListener('blur', endResize);
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
    $window.find('#tamako-theme-selector').on('change', function() { applyTheme(this.value); $('.tamako-theme-panel').slideUp(200); });
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
    
    const btn = document.createElement('div');
    btn.id = 'tamako-market-toggle';
    btn.className = `tamako-toggle theme-tamako ${isMobile ? 'tamako-toggle-mobile' : ''}`;
    btn.innerHTML = `<span class="tamako-toggle-icon">${ICONS.store}</span><span class="tamako-toggle-text">玉子市场</span>`;
    btn.title = '拖拽移动 / 点击打开玉子市场';
    document.body.appendChild(btn);
    
    const defaultPos = getDefaultTogglePosition();
    const $btn = $(btn);
    $btn.css({ left: (settings.toggleX ?? defaultPos.x) + 'px', top: (settings.toggleY ?? defaultPos.y) + 'px', right: 'auto', bottom: 'auto' });
    
    initToggleDraggable($btn);
}

function initToggleDraggable($toggle) {
    let isDragging = false, hasMoved = false, offsetX, offsetY, startX, startY, startTime;
    const DRAG_THRESHOLD = 5;
    
    $toggle[0].addEventListener('contextmenu', e => e.preventDefault());
    
    function startDrag(e) {
        startTime = Date.now();
        hasMoved = false;
        const pos = getEventPosition(e);
        const rect = $toggle[0].getBoundingClientRect();
        offsetX = pos.x - rect.left;
        offsetY = pos.y - rect.top;
        startX = pos.x;
        startY = pos.y;
        $toggle.addClass('dragging');
        e.preventDefault();
    }
    
    function moveDrag(e) {
        if (!$toggle.hasClass('dragging')) return;
        const pos = getEventPosition(e);
        if (Math.abs(pos.x - startX) > DRAG_THRESHOLD || Math.abs(pos.y - startY) > DRAG_THRESHOLD) {
            isDragging = true;
            hasMoved = true;
        }
        if (!isDragging) return;
        const constrained = constrainPosition(pos.x - offsetX, pos.y - offsetY, $toggle[0].offsetWidth, $toggle[0].offsetHeight);
        $toggle.css({ left: constrained.x + 'px', top: constrained.y + 'px' });
        e.preventDefault();
    }
    
    function endDrag() {
        $toggle.removeClass('dragging');
        isDragging = false;
        if (hasMoved) {
            saveSetting('toggleX', parseInt($toggle.css('left')));
            saveSetting('toggleY', parseInt($toggle.css('top')));
        }
        if (!hasMoved && Date.now() - startTime < 300) toggleWindow();
        hasMoved = false;
    }
    
    $toggle[0].addEventListener('mousedown', startDrag);
    $toggle[0].addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);
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
}

function updateCurrentContent(content, rawMessage) {
    const $content = $('#tamako-market-window .tamako-content[data-content="current"]');
    const settings = getSettings();
    
    if (!content?.trim()) {
        $content.html(`<div class="tamako-empty"><span class="icon">🐔</span><span class="message">${getDeraMessage('empty')}</span></div>`);
        return;
    }
    
    if (settings.beautifier?.enabled && settings.beautifier?.template) {
        const templateData = parseBeautifierTemplate(settings.beautifier.template);
        if (templateData && rawMessage && renderWithBeautifier($content, rawMessage, templateData)) return;
    }
    
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
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
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
                try {
                    context.eventSource.on(eventName, () => validateCapturedPlots());
                } catch (e) {}
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
            console.log('[玉子市场] 开店啦！v2.4.2');
        } catch (e) { console.error('[玉子市场] 初始化错误:', e); }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady);
    else setTimeout(onReady, 100);
})();
