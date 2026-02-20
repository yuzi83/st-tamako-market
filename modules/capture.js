// modules/capture.js
/**
 * 玉子市场 - 消息捕获系统
 * @version 2.8.4
 */

import {
    extensionEnabled, validateDebounceTimer,
    setCapturedPlots, setValidateDebounceTimer, getCapturedPlots
} from './state.js';
import { getSettings } from './utils.js';

// ===== 标签提取 =====

export function extractTagContent(message, tagName) {
    const matches = [];
    let match;
    const regex = new RegExp(`(?<!\`)<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>(?!\`)`, 'gi');
    while ((match = regex.exec(message)) !== null) {
        matches.push(match[0]);
    }
    return matches;
}

export function extractPlotContent(message) {
    if (!message || !extensionEnabled || !getSettings().autoCapture) return null;
    
    const tags = getSettings().captureTags || [];
    if (tags.length === 0) return null;
    
    const keywords = [
        '以上是用户的本轮输入', '以上是用户本轮输入', '以上是用户的',
        '以下是用户的本轮输入', '以下是用户本轮输入', '以下是用户的'
    ];
    
    if (!keywords.some(k => message.includes(k))) return null;
    
    const parts = [];
    for (const tag of tags) {
        parts.push(...extractTagContent(message, tag.trim()));
    }
    
    if (parts.length === 0) return null;
    
    return { content: parts.join('\n\n'), rawMessage: message };
}

// ===== 消息处理 =====

export function handleUserMessage(messageIndex, callbacks = {}) {
    if (!extensionEnabled || !getSettings().autoCapture) return false;
    
    try {
        const context = SillyTavern.getContext();
        if (!context?.chat || messageIndex < 0 || messageIndex >= context.chat.length) return false;
        
        const message = context.chat[messageIndex];
        if (!message?.is_user || !message.mes) return false;
        
        const currentPlots = getCapturedPlots();
        if (currentPlots.some(p => p.messageIndex === messageIndex)) return false;
        
        const extracted = extractPlotContent(message.mes);
        if (!extracted) return false;
        
        const settings = getSettings();
        const newPlots = [...currentPlots, {
            content: extracted.content,
            rawMessage: extracted.rawMessage,
            timestamp: Date.now(),
            messageIndex
        }];
        
        if (newPlots.length > settings.maxStoredPlots) {
            newPlots.splice(0, newPlots.length - settings.maxStoredPlots);
        }
        
        newPlots.sort((a, b) => a.messageIndex - b.messageIndex);
        setCapturedPlots(newPlots);
        
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

export function checkLatestUserMessage(callbacks = {}) {
    if (!extensionEnabled || !getSettings().autoCapture) return;
    
    try {
        const context = SillyTavern.getContext();
        if (!context?.chat) return;
        
        for (let i = context.chat.length - 1; i >= 0; i--) {
            if (context.chat[i]?.is_user) {
                const currentPlots = getCapturedPlots();
                if (!currentPlots.some(p => p.messageIndex === i)) {
                    handleUserMessage(i, callbacks);
                }
                break;
            }
        }
    } catch (e) {
        console.error('[玉子市场] 检查最新消息错误:', e);
    }
}

export function scanAllMessages(callbacks = {}) {
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
        
        for (let i = context.chat.length - 1; i >= 0 && scannedCount < maxScan; i--) {
            if (!context.chat[i]?.is_user) continue;
            scannedCount++;
            
            const extracted = extractPlotContent(context.chat[i].mes);
            if (!extracted) continue;
            if (newPlots.some(p => p.messageIndex === i)) continue;
            
            newPlots.push({
                content: extracted.content,
                rawMessage: extracted.rawMessage,
                timestamp: Date.now() - (context.chat.length - i) * 1000,
                messageIndex: i
            });
            foundCount++;
            
            if (!latestExtracted) latestExtracted = extracted;
        }
        
        if (scannedCount >= maxScan) {
            for (let i = context.chat.length - scannedCount - 1; i >= 0; i--) {
                if (context.chat[i]?.is_user) {
                    result.limited = true;
                    break;
                }
            }
        }
        
        newPlots.sort((a, b) => a.messageIndex - b.messageIndex);
        if (newPlots.length > maxStore) {
            newPlots.splice(0, newPlots.length - maxStore);
        }
        
        setCapturedPlots(newPlots);
        
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

export function validateCapturedPlots(callbacks = {}) {
    if (!extensionEnabled) return;
    
    if (validateDebounceTimer) clearTimeout(validateDebounceTimer);
    
    setValidateDebounceTimer(setTimeout(() => {
        doValidateCapturedPlots(callbacks);
    }, 300));
}

function doValidateCapturedPlots(callbacks = {}) {
    try {
        const context = SillyTavern.getContext();
        if (!context?.chat) return;
        
        const chatLength = context.chat.length;
        const currentPlots = getCapturedPlots();
        const originalLength = currentPlots.length;
        
        let validPlots = currentPlots.filter(plot => {
            if (plot.messageIndex >= chatLength) return false;
            const msg = context.chat[plot.messageIndex];
            if (!msg || !msg.is_user || !msg.mes) return false;
            
            const tags = getSettings().captureTags || [];
            for (const tag of tags) {
                if (plot.content.includes(`<${tag}`) && msg.mes.includes(`<${tag}`)) {
                    return true;
                }
            }
            return false;
        });
        
        if (validPlots.length !== originalLength) {
            validPlots = [];
            const settings = getSettings();
            const maxScan = settings.maxScanMessages || 50;
            const maxStore = settings.maxStoredPlots || 50;
            let scannedCount = 0;
            
            for (let i = chatLength - 1; i >= 0 && scannedCount < maxScan; i--) {
                if (!context.chat[i]?.is_user) continue;
                scannedCount++;
                
                const extracted = extractPlotContent(context.chat[i].mes);
                if (!extracted) continue;
                
                validPlots.push({
                    content: extracted.content,
                    rawMessage: extracted.rawMessage,
                    timestamp: Date.now() - (chatLength - i) * 1000,
                    messageIndex: i
                });
            }
            
            validPlots.sort((a, b) => a.messageIndex - b.messageIndex);
            if (validPlots.length > maxStore) {
                validPlots = validPlots.slice(-maxStore);
            }
            
            setCapturedPlots(validPlots);
            
            if (validPlots.length > 0) {
                const latest = validPlots[validPlots.length - 1];
                if (callbacks.onUpdate) {
                    callbacks.onUpdate(latest.content, latest.rawMessage);
                }
            } else {
                if (callbacks.onUpdate) {
                    callbacks.onUpdate('', '');
                }
            }
            
            if (callbacks.onHistoryUpdate) {
                callbacks.onHistoryUpdate();
            }
        }
    } catch (e) {
        console.error('[玉子市场] 验证捕获记录失败:', e);
    }
}

// ===== 过滤 =====

export function filterPlots(plots, query) {
    if (!query) return plots;
    const lowerQuery = query.toLowerCase();
    return plots.filter(p => {
        const content = p.content.toLowerCase();
        const amCodes = extractAMCodes(p.content).join(' ').toLowerCase();
        return content.includes(lowerQuery) || amCodes.includes(lowerQuery);
    });
}

function extractAMCodes(content) {
    const matches = content.match(/AM\d{4}/gi);
    return matches ? [...new Set(matches.map(m => m.toUpperCase()))] : [];
}

