// modules/capture.js
/**
 * 玉子市场 - 消息捕获系统
 * @version 2.8.6
 * 
 * 更新日志:
 * - v2.8.6: 添加 JSDoc 类型注释
 * - v2.8.6: 预编译正则表达式，提升性能
 * - v2.8.6: 优化消息扫描逻辑
 */

import {
    extensionEnabled, validateDebounceTimer,
    setCapturedPlots, setValidateDebounceTimer, getCapturedPlots
} from './state.js';
import { getSettings } from './utils.js';

// ===== 类型定义 =====

/**
 * @typedef {Object} ExtractedContent
 * @property {string} content - 提取的内容
 * @property {string} rawMessage - 原始消息
 */

/**
 * @typedef {Object} CapturedPlot
 * @property {string} content - 捕获的内容
 * @property {string} rawMessage - 原始消息
 * @property {number} timestamp - 时间戳
 * @property {number} messageIndex - 消息索引
 */

/**
 * @typedef {Object} ScanResult
 * @property {boolean} limited - 是否达到扫描限制
 * @property {number} count - 找到的数量
 */

/**
 * @typedef {Object} Callbacks
 * @property {Function} [onUpdate] - 更新回调
 * @property {Function} [onHistoryUpdate] - 历史更新回调
 * @property {Function} [onNewItem] - 新项目回调
 */

// ===== 预编译正则表达式（性能优化）=====

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
 * @param {string} tagName - 标签名
 * @returns {RegExp}
 */
function getTagRegex(tagName) {
    const cacheKey = tagName.toLowerCase();
    
    if (!tagRegexCache.has(cacheKey)) {
        // 预编译正则表达式，避免重复创建
        const regex = new RegExp(
            `(?<!\`)<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>(?!\`)`,
            'gi'
        );
        tagRegexCache.set(cacheKey, regex);
    }
    
    // 重置正则表达式的 lastIndex
    const regex = tagRegexCache.get(cacheKey);
    regex.lastIndex = 0;
    return regex;
}

/**
 * 清理正则缓存（在标签配置变更时调用）
 */
export function clearTagRegexCache() {
    tagRegexCache.clear();
}

// ===== 标签提取 =====

/**
 * 从消息中提取指定标签的内容
 * @param {string} message - 消息内容
 * @param {string} tagName - 标签名
 * @returns {string[]} 匹配到的标签内容数组
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
 * @param {string} message - 消息内容
 * @returns {ExtractedContent|null} 提取的内容或 null
 */
export function extractPlotContent(message) {
    // 快速检查
    if (!message || !extensionEnabled || !getSettings().autoCapture) {
        return null;
    }
    
    const tags = getSettings().captureTags || [];
    if (tags.length === 0) return null;
    
    // 使用预编译正则检查关键词
    const hasKeyword = KEYWORD_PATTERNS.some(pattern => pattern.test(message));
    if (!hasKeyword) return null;
    
    // 重置正则的 lastIndex（因为使用了 test 方法）
    KEYWORD_PATTERNS.forEach(pattern => pattern.lastIndex = 0);
    
    // 提取所有标签内容
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
        rawMessage: message 
    };
}

// ===== 消息处理 =====

/**
 * 处理用户消息
 * @param {number} messageIndex - 消息索引
 * @param {Callbacks} [callbacks={}] - 回调函数
 * @returns {boolean} 是否成功捕获
 */
export function handleUserMessage(messageIndex, callbacks = {}) {
    if (!extensionEnabled || !getSettings().autoCapture) return false;
    
    try {
        const context = SillyTavern.getContext();
        if (!context?.chat || messageIndex < 0 || messageIndex >= context.chat.length) {
            return false;
        }
        
        const message = context.chat[messageIndex];
        if (!message?.is_user || !message.mes) return false;
        
        // 检查是否已捕获
        const currentPlots = getCapturedPlots();
        if (currentPlots.some(p => p.messageIndex === messageIndex)) {
            return false;
        }
        
        // 提取内容
        const extracted = extractPlotContent(message.mes);
        if (!extracted) return false;
        
        // 添加新捕获
        const settings = getSettings();
        const newPlots = [...currentPlots, {
            content: extracted.content,
            rawMessage: extracted.rawMessage,
            timestamp: Date.now(),
            messageIndex
        }];
        
        // 限制数量
        if (newPlots.length > settings.maxStoredPlots) {
            newPlots.splice(0, newPlots.length - settings.maxStoredPlots);
        }
        
        // 排序并保存
        newPlots.sort((a, b) => a.messageIndex - b.messageIndex);
        setCapturedPlots(newPlots);
        
        // 触发回调
        if (callbacks.onUpdate) {
            callbacks.onUpdate(extracted.content, extracted.rawMessage);
        }
        if (callbacks.onHistoryUpdate) {
            callbacks.onHistoryUpdate();
        }
        if (callbacks.onNewItem) {
            callbacks.onNewItem();
        }
        
        return true;
    } catch (e) {
        console.error('[玉子市场] 处理消息错误:', e);
        return false;
    }
}

/**
 * 检查最新的用户消息
 * @param {Callbacks} [callbacks={}] - 回调函数
 */
export function checkLatestUserMessage(callbacks = {}) {
    if (!extensionEnabled || !getSettings().autoCapture) return;
    
    try {
        const context = SillyTavern.getContext();
        if (!context?.chat) return;
        
        // 从后向前查找最新的用户消息
        for (let i = context.chat.length - 1; i >= 0; i--) {
            if (context.chat[i]?.is_user) {
                const currentPlots = getCapturedPlots();
                if (!currentPlots.some(p => p.messageIndex === i)) {
                    handleUserMessage(i, callbacks);
                }
                break; // 只处理最新的一条
            }
        }
    } catch (e) {
        console.error('[玉子市场] 检查最新消息错误:', e);
    }
}

/**
 * 扫描所有消息
 * @param {Callbacks} [callbacks={}] - 回调函数
 * @returns {ScanResult} 扫描结果
 */
export function scanAllMessages(callbacks = {}) {
    /** @type {ScanResult} */
    const result = { limited: false, count: 0 };
    
    if (!extensionEnabled) return result;
    
    try {
        const context = SillyTavern.getContext();
        if (!context?.chat?.length) return result;
        
        const settings = getSettings();
        const maxScan = settings.maxScanMessages || 50;
        const maxStore = settings.maxStoredPlots || 50;
        
        let latestExtracted = null;
        let scannedCount = 0;
        let foundCount = 0;
        const currentPlots = getCapturedPlots();
        const newPlots = [...currentPlots];
        
        // 使用 Set 优化查找性能
        const existingIndices = new Set(currentPlots.map(p => p.messageIndex));
        
        // 从后向前扫描
        for (let i = context.chat.length - 1; i >= 0 && scannedCount < maxScan; i--) {
            if (!context.chat[i]?.is_user) continue;
            
            scannedCount++;
            
            // 跳过已捕获的消息
            if (existingIndices.has(i)) continue;
            
            const extracted = extractPlotContent(context.chat[i].mes);
            if (!extracted) continue;
            
            newPlots.push({
                content: extracted.content,
                rawMessage: extracted.rawMessage,
                timestamp: Date.now() - (context.chat.length - i) * 1000,
                messageIndex: i
            });
            foundCount++;
            
            if (!latestExtracted) latestExtracted = extracted;
        }
        
        // 检查是否达到扫描限制
        if (scannedCount >= maxScan) {
            for (let i = context.chat.length - scannedCount - 1; i >= 0; i--) {
                if (context.chat[i]?.is_user) {
                    result.limited = true;
                    break;
                }
            }
        }
        
        // 排序并限制数量
        newPlots.sort((a, b) => a.messageIndex - b.messageIndex);
        if (newPlots.length > maxStore) {
            newPlots.splice(0, newPlots.length - maxStore);
        }
        
        setCapturedPlots(newPlots);
        
        // 触发回调
        if (latestExtracted && callbacks.onUpdate) {
            callbacks.onUpdate(latestExtracted.content, latestExtracted.rawMessage);
        }
        if (callbacks.onHistoryUpdate) {
            callbacks.onHistoryUpdate();
        }
        
        result.count = foundCount;
    } catch (e) {
        console.error('[玉子市场] 扫描错误:', e);
    }
    
    return result;
}

// ===== 验证捕获记录 =====

/**
 * 验证捕获的记录（带防抖）
 * @param {Callbacks} [callbacks={}] - 回调函数
 */
export function validateCapturedPlots(callbacks = {}) {
    if (!extensionEnabled) return;
    
    if (validateDebounceTimer) clearTimeout(validateDebounceTimer);
    
    setValidateDebounceTimer(setTimeout(() => {
        doValidateCapturedPlots(callbacks);
    }, 300));
}

/**
 * 执行验证捕获记录
 * @param {Callbacks} [callbacks={}] - 回调函数
 * @private
 */
function doValidateCapturedPlots(callbacks = {}) {
    try {
        const context = SillyTavern.getContext();
        if (!context?.chat) return;

        const currentPlots = getCapturedPlots();
        const settings = getSettings();
        const maxStore = settings.maxStoredPlots || 50;

        let hasChange = false;
        const validatedPlots = [];

        for (const plot of currentPlots) {
            const msg = context.chat?.[plot.messageIndex];
            
            // 消息不存在或已被删除
            if (!msg || !msg.is_user || !msg.mes) {
                hasChange = true;
                continue;
            }

            // 重新提取内容
            const extracted = extractPlotContent(msg.mes);
            if (!extracted) {
                hasChange = true;
                continue;
            }

            // 合并数据
            const mergedPlot = {
                ...plot,
                content: extracted.content,
                rawMessage: extracted.rawMessage
            };

            // 检查内容是否变化
            if (mergedPlot.content !== plot.content || mergedPlot.rawMessage !== plot.rawMessage) {
                hasChange = true;
            }

            validatedPlots.push(mergedPlot);
        }

        // 排序并限制数量
        validatedPlots.sort((a, b) => a.messageIndex - b.messageIndex);
        let finalPlots = validatedPlots;
        
        if (finalPlots.length > maxStore) {
            finalPlots = finalPlots.slice(-maxStore);
            hasChange = true;
        }

        // 无变化则跳过
        if (!hasChange && finalPlots.length === currentPlots.length) {
            return;
        }

        setCapturedPlots(finalPlots);

        // 触发回调
        if (callbacks.onUpdate) {
            if (finalPlots.length > 0) {
                const latest = finalPlots[finalPlots.length - 1];
                callbacks.onUpdate(latest.content, latest.rawMessage);
            } else {
                callbacks.onUpdate('', '');
            }
        }

        if (callbacks.onHistoryUpdate) {
            callbacks.onHistoryUpdate();
        }
    } catch (e) {
        console.error('[玉子市场] 验证捕获记录失败:', e);
    }
}

// ===== 过滤功能 =====

/**
 * 过滤捕获的记录
 * @param {CapturedPlot[]} plots - 捕获的记录数组
 * @param {string} query - 搜索关键词
 * @returns {CapturedPlot[]} 过滤后的数组
 */
export function filterPlots(plots, query) {
    if (!query || !plots) return plots || [];
    
    const lowerQuery = query.toLowerCase();
    
    return plots.filter(p => {
        const content = p.content.toLowerCase();
        const amCodes = extractAMCodes(p.content).join(' ').toLowerCase();
        return content.includes(lowerQuery) || amCodes.includes(lowerQuery);
    });
}

/**
 * 提取 AM 编号
 * @param {string} content - 内容
 * @returns {string[]} AM编号数组
 * @private
 */
function extractAMCodes(content) {
    if (!content) return [];
    
    // 重置正则
    AM_CODE_REGEX.lastIndex = 0;
    const matches = content.match(AM_CODE_REGEX);
    
    return matches ? [...new Set(matches.map(m => m.toUpperCase()))] : [];
}
