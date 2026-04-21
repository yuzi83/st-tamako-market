// modules/beautifier-cache.js
/**
 * 玉子市场 - 美化器缓存签名工具
 *
 * 目标：提供比长度+首中尾字符更稳定的轻量签名，
 * 同时保持足够低的计算成本，避免缓存判断本身成为新热点。
 */

const EMPTY_VALUE_SIGNATURE = '0:0';
const EMPTY_CHAT_SIGNATURE = 'empty';

/**
 * 计算字符串的轻量 32 位哈希签名。
 * 使用线性扫描滚动哈希，稳定且成本可控。
 *
 * @param {unknown} value
 * @returns {string}
 */
export function buildValueSignature(value) {
    if (value === null || value === undefined) {
        return EMPTY_VALUE_SIGNATURE;
    }

    const text = String(value);
    if (!text) {
        return EMPTY_VALUE_SIGNATURE;
    }

    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 16777619) >>> 0;
    }

    return `${text.length}:${hash.toString(16)}`;
}

/**
 * 构建聊天数组签名。
 *
 * @param {Array<any>} chat
 * @returns {string}
 */
export function buildChatDataSignature(chat) {
    if (!Array.isArray(chat) || chat.length === 0) {
        return EMPTY_CHAT_SIGNATURE;
    }

    const parts = [String(chat.length)];

    for (const msg of chat) {
        if (!msg) {
            parts.push('null');
            continue;
        }

        const swipeSignatures = Array.isArray(msg.swipes)
            ? msg.swipes.map(swipe => {
                if (typeof swipe === 'string') {
                    return buildValueSignature(swipe);
                }
                if (swipe?.extra?.qrf_plot) {
                    return buildValueSignature(swipe.extra.qrf_plot);
                }
                return EMPTY_VALUE_SIGNATURE;
            }).join(',')
            : '';

        parts.push([
            msg.is_user ? 'u' : 'a',
            buildValueSignature(msg.mes),
            buildValueSignature(msg.extra?.qrf_plot),
            buildValueSignature(msg.qrf_plot),
            Array.isArray(msg.swipes) ? msg.swipes.length : 0,
            swipeSignatures,
        ].join('~'));
    }

    return parts.join('|');
}
