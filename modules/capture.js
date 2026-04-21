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
import { getSettings } from './settings.js';
export { clearTagRegexCache, extractTagContent, filterPlots } from './capture-core.js';
import { extractPlotContent as extractPlotContentCore } from './capture-core.js';

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

// ===== 标签提取与过滤纯逻辑 =====

/**
 * 从消息中提取剧情内容
 * @param {string} message - 消息内容
 * @returns {ExtractedContent|null} 提取的内容或 null
 */
export function extractPlotContent(message, settings = null) {
    const effectiveSettings = settings || getSettings();
    return extractPlotContentCore(message, effectiveSettings, extensionEnabled);
}

// ===== 消息处理 =====

/**
 * 处理用户消息
 * @param {number} messageIndex - 消息索引
 * @param {Callbacks} [callbacks={}] - 回调函数
 * @param {Object|null} [settings=null] - 当前设置快照
 * @returns {boolean} 是否成功捕获
 */
export function handleUserMessage(messageIndex, callbacks = {}, settings = null) {
    const effectiveSettings = settings || getSettings();
    if (!extensionEnabled || !effectiveSettings.autoCapture) return false;
    
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
        const extracted = extractPlotContent(message.mes, effectiveSettings);
        if (!extracted) return false;
        
        // 添加新捕获
        const newPlots = [...currentPlots, {
            content: extracted.content,
            rawMessage: extracted.rawMessage,
            timestamp: Date.now(),
            messageIndex
        }];
        
        // 限制数量
        if (newPlots.length > effectiveSettings.maxStoredPlots) {
            newPlots.splice(0, newPlots.length - effectiveSettings.maxStoredPlots);
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
    const settings = getSettings();
    if (!extensionEnabled || !settings.autoCapture) return;
    
    try {
        const context = SillyTavern.getContext();
        if (!context?.chat) return;
        
        // 从后向前查找最新的用户消息
        for (let i = context.chat.length - 1; i >= 0; i--) {
            if (context.chat[i]?.is_user) {
                const currentPlots = getCapturedPlots();
                if (!currentPlots.some(p => p.messageIndex === i)) {
                    handleUserMessage(i, callbacks, settings);
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
            
            const extracted = extractPlotContent(context.chat[i].mes, settings);
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
            const extracted = extractPlotContent(msg.mes, settings);
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

