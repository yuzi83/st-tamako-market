// modules/capture-core.js
/**
 * 玉子市场 - 捕获核心纯逻辑
 *
 * 目标：抽离不依赖 DOM 和 SillyTavern UI 的纯逻辑，
 * 为自动化测试提供稳定边界。
 */

/** @type {Map<string, RegExp>} 标签正则缓存 */
const tagRegexCache = new Map();

/** @type {RegExp} AM编号正则 */
const AM_CODE_REGEX = /AM\d{4}/gi;

/** @type {RegExp[]} 关键词正则列表 */
const KEYWORD_PATTERNS = [
    /以上是用户的本轮输入/,
    /以上是用户本轮输入/,
    /以上是用户的/,
    /以下是用户的本轮输入/,
    /以下是用户本轮输入/,
    /以下是用户的/
];

/**
 * 获取或创建标签正则表达式（带缓存）
 * @param {string} tagName
 * @returns {RegExp}
 */
export function getTagRegex(tagName) {
    const cacheKey = tagName.toLowerCase();

    if (!tagRegexCache.has(cacheKey)) {
        const regex = new RegExp(
            `(?<!\`)<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>(?!\`)`,
            'gi'
        );
        tagRegexCache.set(cacheKey, regex);
    }

    const regex = tagRegexCache.get(cacheKey);
    regex.lastIndex = 0;
    return regex;
}

/**
 * 清理标签正则缓存
 */
export function clearTagRegexCache() {
    tagRegexCache.clear();
}

/**
 * 从消息中提取指定标签的内容
 * @param {string} message
 * @param {string} tagName
 * @returns {string[]}
 */
export function extractTagContent(message, tagName) {
    const matches = [];
    if (!message || !tagName) return matches;

    try {
        const regex = getTagRegex(tagName);
        let match;

        while ((match = regex.exec(message)) !== null) {
            matches.push(match[0]);
        }
    } catch (e) {
        console.warn(`[玉子市场] 提取标签 ${tagName} 失败:`, e);
    }

    return matches;
}

/**
 * 从消息中提取剧情内容
 * @param {string} message
 * @param {{ autoCapture?: boolean, captureTags?: string[] } | null} settings
 * @param {boolean} extensionEnabled
 * @returns {{ content: string, rawMessage: string } | null}
 */
export function extractPlotContent(message, settings, extensionEnabled) {
    if (!message || !extensionEnabled || !settings?.autoCapture) {
        return null;
    }

    const tags = settings.captureTags || [];
    if (tags.length === 0) return null;

    const hasKeyword = KEYWORD_PATTERNS.some(pattern => {
        pattern.lastIndex = 0;
        return pattern.test(message);
    });
    if (!hasKeyword) return null;

    KEYWORD_PATTERNS.forEach(pattern => {
        pattern.lastIndex = 0;
    });

    const parts = [];
    for (const tag of tags) {
        const trimmedTag = tag.trim();
        if (trimmedTag) {
            parts.push(...extractTagContent(message, trimmedTag));
        }
    }

    if (parts.length === 0) return null;

    return {
        content: parts.join('\n\n'),
        rawMessage: message,
    };
}

/**
 * 提取 AM 编号
 * @param {string} content
 * @returns {string[]}
 */
export function extractAMCodes(content) {
    if (!content) return [];

    AM_CODE_REGEX.lastIndex = 0;
    const matches = content.match(AM_CODE_REGEX);
    return matches ? [...new Set(matches.map(match => match.toUpperCase()))] : [];
}

/**
 * 过滤捕获记录
 * @param {{ content: string }[] | null | undefined} plots
 * @param {string} query
 * @returns {{ content: string }[]}
 */
export function filterPlots(plots, query) {
    if (!query || !plots) return plots || [];

    const lowerQuery = query.toLowerCase();

    return plots.filter(plot => {
        const content = plot.content.toLowerCase();
        const amCodes = extractAMCodes(plot.content).join(' ').toLowerCase();
        return content.includes(lowerQuery) || amCodes.includes(lowerQuery);
    });
}
