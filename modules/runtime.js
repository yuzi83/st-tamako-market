// modules/runtime.js
/**
 * 玉子市场 - 运行时生命周期
 * @version 2.8.6
 *
 * 负责：事件装配、DOM 观察、扫描调度、运行时资源清理
 */

import {
    setCapturedPlots,
    getCapturedPlots,
    setMutationObserver,
    initEventListenerManager,
    cleanupAllResources,
} from './state.js';
import { EventTypes, getSTContext, getEventSource } from './events.js';
import {
    handleUserMessage,
    checkLatestUserMessage,
    scanAllMessages,
    validateCapturedPlots,
} from './capture.js';

const CHAT_CHANGE_DEBOUNCE_MS = 250;
const CHAT_CHANGE_SCAN_DELAY_MS = 800;
const ADD_DEBOUNCE_MS = 500;
const REMOVE_DEBOUNCE_MS = 300;
const MESSAGE_SENT_DELAY_MS = 300;
const USER_MESSAGE_RENDERED_DELAY_MS = 200;
const GENERATION_CHECK_DELAY_MS = 300;
const OBSERVER_RETRY_DELAY_MS = 1000;
const INITIAL_SCAN_DELAY_MS = 2000;

function clearTimer(timerId) {
    if (timerId) {
        clearTimeout(timerId);
    }
    return null;
}

/**
 * @typedef {Object} RuntimeCallbacks
 * @property {(content: string, rawMessage: string) => void} [onUpdate]
 * @property {() => void} [onHistoryUpdate]
 * @property {() => void} [onNewItem]
 */

/**
 * 创建运行时控制器
 * @param {RuntimeCallbacks} [uiCallbacks={}]
 */
export function createRuntimeController(uiCallbacks = {}) {
    let initialScanDone = false;
    let chatChangeScanTimer = null;
    let addDebounceTimer = null;
    let removeDebounceTimer = null;
    let observerRetryTimer = null;
    let initialScanTimer = null;
    let started = false;
    let disposed = false;

    function getCallbacks() {
        return {
            onUpdate: uiCallbacks.onUpdate,
            onHistoryUpdate: uiCallbacks.onHistoryUpdate,
            onNewItem: uiCallbacks.onNewItem,
        };
    }

    function scheduleObserverRetry() {
        observerRetryTimer = clearTimer(observerRetryTimer);
        if (disposed) {
            return;
        }

        observerRetryTimer = setTimeout(() => {
            observerRetryTimer = null;
            setupMutationObserver();
        }, OBSERVER_RETRY_DELAY_MS);
    }

    function setupMutationObserver() {
        if (disposed) {
            return;
        }

        try {
            const chatContainer = document.getElementById('chat');
            if (!chatContainer) {
                scheduleObserverRetry();
                return;
            }

            const callbacks = getCallbacks();
            const observer = new MutationObserver((mutations) => {
                let hasAdded = false;
                let hasRemoved = false;

                for (const mutation of mutations) {
                    if (mutation.addedNodes.length > 0) {
                        for (const node of mutation.addedNodes) {
                            if (
                                node.nodeType === 1 &&
                                (node.classList?.contains('mes') || node.querySelector?.('.mes'))
                            ) {
                                hasAdded = true;
                                break;
                            }
                        }
                    }

                    if (mutation.removedNodes.length > 0) {
                        for (const node of mutation.removedNodes) {
                            if (
                                node.nodeType === 1 &&
                                (node.classList?.contains('mes') || node.querySelector?.('.mes'))
                            ) {
                                hasRemoved = true;
                                break;
                            }
                        }
                    }

                    if (hasAdded && hasRemoved) {
                        break;
                    }
                }

                if (hasAdded) {
                    addDebounceTimer = clearTimer(addDebounceTimer);
                    addDebounceTimer = setTimeout(() => {
                        addDebounceTimer = null;
                        checkLatestUserMessage(callbacks);
                    }, ADD_DEBOUNCE_MS);
                }

                if (hasRemoved) {
                    removeDebounceTimer = clearTimer(removeDebounceTimer);
                    removeDebounceTimer = setTimeout(() => {
                        removeDebounceTimer = null;
                        validateCapturedPlots(callbacks);
                    }, REMOVE_DEBOUNCE_MS);
                }
            });

            observer.observe(chatContainer, { childList: true, subtree: true });
            setMutationObserver(observer);

            console.log('[玉子市场] MutationObserver 已设置');
        } catch (error) {
            console.error('[玉子市场] DOM监听失败:', error);
        }
    }

    function doScanAndUpdate() {
        const callbacks = getCallbacks();
        scanAllMessages(callbacks);

        const plots = getCapturedPlots();
        if (plots.length > 0) {
            const latest = plots[plots.length - 1];
            callbacks.onUpdate?.(latest.content, latest.rawMessage);
        }

        callbacks.onHistoryUpdate?.();
        initialScanDone = true;
    }

    function scheduleInitialScan() {
        initialScanTimer = clearTimer(initialScanTimer);
        initialScanTimer = setTimeout(() => {
            initialScanTimer = null;
            if (disposed || initialScanDone) {
                return;
            }

            const context = getSTContext();
            if (context?.chat?.length > 0) {
                doScanAndUpdate();
            }
        }, INITIAL_SCAN_DELAY_MS);
    }

    function registerEventListeners() {
        const manager = initEventListenerManager();
        const context = getSTContext();
        const eventSource = getEventSource();
        const callbacks = getCallbacks();

        if (!context || !eventSource) {
            console.warn('[玉子市场] 无法获取 SillyTavern 上下文，仅使用 DOM 监听');
            setupMutationObserver();
            scheduleInitialScan();
            return;
        }

        console.log('[玉子市场] 初始化事件监听器...');

        let lastChatChangeAt = 0;
        const onChatChanged = () => {
            const now = Date.now();
            if (now - lastChatChangeAt < CHAT_CHANGE_DEBOUNCE_MS) {
                return;
            }
            lastChatChangeAt = now;

            setCapturedPlots([]);
            chatChangeScanTimer = clearTimer(chatChangeScanTimer);
            chatChangeScanTimer = setTimeout(() => {
                chatChangeScanTimer = null;
                doScanAndUpdate();
            }, CHAT_CHANGE_SCAN_DELAY_MS);
        };

        manager.register(eventSource, EventTypes.CHAT_CHANGED, onChatChanged, {
            useAlias: true,
            debounce: 0,
        });

        manager.register(eventSource, EventTypes.MESSAGE_SENT, (messageIndex) => {
            setTimeout(() => handleUserMessage(messageIndex, callbacks), MESSAGE_SENT_DELAY_MS);
        });

        manager.register(eventSource, EventTypes.USER_MESSAGE_RENDERED, (messageIndex) => {
            setTimeout(() => handleUserMessage(messageIndex, callbacks), USER_MESSAGE_RENDERED_DELAY_MS);
        });

        manager.register(eventSource, EventTypes.GENERATION_STARTED, () => {
            setTimeout(() => checkLatestUserMessage(callbacks), GENERATION_CHECK_DELAY_MS);
        });

        manager.register(eventSource, EventTypes.GENERATION_ENDED, () => {
            setTimeout(() => checkLatestUserMessage(callbacks), GENERATION_CHECK_DELAY_MS);
        });

        const validateEvents = [
            EventTypes.MESSAGE_DELETED,
            EventTypes.MESSAGE_UPDATED,
            EventTypes.MESSAGE_SWIPED,
        ];

        for (const eventType of validateEvents) {
            manager.register(eventSource, eventType, () => validateCapturedPlots(callbacks), {
                useAlias: true,
            });
        }

        console.log(`[玉子市场] 已注册 ${manager.count} 个事件监听器`);

        setupMutationObserver();
        scheduleInitialScan();
    }

    function start() {
        if (started) {
            return;
        }

        started = true;
        disposed = false;
        registerEventListeners();
    }

    function destroy() {
        disposed = true;
        started = false;
        initialScanDone = false;

        chatChangeScanTimer = clearTimer(chatChangeScanTimer);
        addDebounceTimer = clearTimer(addDebounceTimer);
        removeDebounceTimer = clearTimer(removeDebounceTimer);
        observerRetryTimer = clearTimer(observerRetryTimer);
        initialScanTimer = clearTimer(initialScanTimer);

        cleanupAllResources();
    }

    return {
        start,
        destroy,
        forceScan: doScanAndUpdate,
    };
}
