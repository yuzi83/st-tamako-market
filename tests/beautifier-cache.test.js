import test from 'node:test';
import assert from 'node:assert/strict';

import { buildValueSignature, buildChatDataSignature } from '../modules/beautifier-cache.js';

test('buildValueSignature 对空值返回稳定签名', () => {
    assert.equal(buildValueSignature(null), '0:0');
    assert.equal(buildValueSignature(undefined), '0:0');
    assert.equal(buildValueSignature(''), '0:0');
});

test('buildValueSignature 对相同输入返回相同签名', () => {
    const value = '以上是用户的本轮输入 <plot>测试内容</plot>';
    assert.equal(buildValueSignature(value), buildValueSignature(value));
});

test('buildValueSignature 对不同输入返回不同签名', () => {
    const a = '以上是用户的本轮输入 <plot>测试内容A</plot>';
    const b = '以上是用户的本轮输入 <plot>测试内容B</plot>';
    assert.notEqual(buildValueSignature(a), buildValueSignature(b));
});

test('buildChatDataSignature 对空聊天返回固定签名', () => {
    assert.equal(buildChatDataSignature([]), 'empty');
    assert.equal(buildChatDataSignature(null), 'empty');
});

test('buildChatDataSignature 在聊天长度变化时签名变化', () => {
    const chatA = [{ is_user: true, mes: 'A' }];
    const chatB = [{ is_user: true, mes: 'A' }, { is_user: false, mes: 'B' }];

    assert.notEqual(buildChatDataSignature(chatA), buildChatDataSignature(chatB));
});

test('buildChatDataSignature 在消息内容变化时签名变化', () => {
    const chatA = [{ is_user: true, mes: '剧情一', extra: { qrf_plot: 'plot-a' } }];
    const chatB = [{ is_user: true, mes: '剧情二', extra: { qrf_plot: 'plot-a' } }];

    assert.notEqual(buildChatDataSignature(chatA), buildChatDataSignature(chatB));
});

test('buildChatDataSignature 在 swipe 内容变化时签名变化', () => {
    const chatA = [{
        is_user: false,
        mes: '固定消息',
        swipes: ['swipe-a'],
    }];

    const chatB = [{
        is_user: false,
        mes: '固定消息',
        swipes: ['swipe-b'],
    }];

    assert.notEqual(buildChatDataSignature(chatA), buildChatDataSignature(chatB));
});

test('buildChatDataSignature 支持 swipe.extra.qrf_plot 参与签名', () => {
    const chatA = [{
        is_user: false,
        mes: '固定消息',
        swipes: [{ extra: { qrf_plot: 'plot-a' } }],
    }];

    const chatB = [{
        is_user: false,
        mes: '固定消息',
        swipes: [{ extra: { qrf_plot: 'plot-b' } }],
    }];

    assert.notEqual(buildChatDataSignature(chatA), buildChatDataSignature(chatB));
});
