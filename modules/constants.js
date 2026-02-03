// modules/constants.js
/**
 * 玉子市场 - 常量定义
 * @version 2.6.0
 */

export const extensionName = 'TamakoMarket';

export const ICONS = {
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
    copy: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`,
};

// 最大模板数量
export const MAX_TEMPLATES = 10;

export const defaultSettings = {
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
    // 新的美化器结构
    beautifier: {
        enabled: false,
        activeTemplateId: null,  // 当前激活的模板ID
        templates: []  // { id, name, template, createdAt }
    },
    customTheme: null,
};

export const themes = {
    tamako: { name: '🌸 玉子市场', primary: '#FFB6C1', secondary: '#DDA0DD', bg: 'linear-gradient(135deg, #FFF5F7 0%, #FFFFFF 50%, #F8F0FF 100%)', surface: '#FFFFFF', surfaceAlt: '#FFF8FA', text: '#333333', textMuted: '#888888', border: 'rgba(0, 0, 0, 0.1)' },
    ocean: { name: '🌊 海边小店', primary: '#87CEEB', secondary: '#5F9EA0', bg: 'linear-gradient(135deg, #F0F8FF 0%, #FFFFFF 50%, #E6F3FF 100%)', surface: '#FFFFFF', surfaceAlt: '#F0F8FF', text: '#333333', textMuted: '#888888', border: 'rgba(0, 0, 0, 0.1)' },
    sunflower: { name: '🌻 向日葵田', primary: '#FFD700', secondary: '#FFA500', bg: 'linear-gradient(135deg, #FFFEF0 0%, #FFFFFF 50%, #FFF8E7 100%)', surface: '#FFFFFF', surfaceAlt: '#FFFEF0', text: '#333333', textMuted: '#888888', border: 'rgba(0, 0, 0, 0.1)' },
    night: { name: '🌙 夜间模式', primary: '#9370DB', secondary: '#6A5ACD', bg: 'linear-gradient(135deg, #2D2D3A 0%, #1E1E28 50%, #252532 100%)', surface: '#1E1E28', surfaceAlt: '#2D2D3A', text: '#E0E0E0', textMuted: '#888888', border: '#3D3D4A' },
};

export const defaultCustomTheme = {
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

export const fontOptions = {
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

export const deraMessages = {
    empty: ['德拉在打瞌睡...', '店里空空的，德拉好无聊~', '德拉等着新货到来！'],
    newItem: ['德拉发现了新货！', '有新商品入库啦！', '德拉：这个看起来不错哦~'],
    scanning: ['德拉正在努力搜寻...', '等等，德拉在找东西~', '德拉的雷达启动中...'],
    found: ['德拉找到了好多东西！', '搜寻完毕！德拉很棒吧~', '库存已更新，德拉辛苦了！'],
    delete: ['德拉帮你打包好了~', '清理完毕！店铺更整洁了~', '德拉：这些就交给我处理吧！'],
    noResult: ['德拉找不到这个呢...', '没有匹配的商品哦~', '德拉翻遍了也没找到~'],
    tooMany: ['商品太多了，德拉只拿了一部分~', '库存爆满！德拉尽力了~'],
    loading: ['德拉正在准备...', '稍等一下哦~', '德拉在努力加载中...'],
    theme: ['德拉帮你换装啦~', '新风格真好看！', '德拉喜欢这个颜色~'],
    templateSaved: ['模板已收藏！', '德拉帮你保存好了~', '新模板入库成功！'],
    templateDeleted: ['模板已移除~', '德拉帮你清理掉了~'],
    templateSwitch: ['切换成功！', '德拉换上新衣服啦~', '焕然一新！'],
};
