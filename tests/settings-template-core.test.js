import test from 'node:test';
import assert from 'node:assert/strict';

import {
    VALID_TEMPLATE_EXTENSIONS,
    getTemplateFileExtension,
    isValidTemplateExtension,
    deriveTemplateName,
    createTemplateRecord,
    resolveTemplateSelection,
    resolveTemplateDeletion,
    normalizeTemplateName,
    resolveTemplateRename,
} from '../modules/settings-template-core.js';

test('VALID_TEMPLATE_EXTENSIONS 包含支持的模板扩展名', () => {
    assert.deepEqual(VALID_TEMPLATE_EXTENSIONS, ['.html', '.htm', '.json', '.txt']);
});

test('getTemplateFileExtension 能提取合法扩展名', () => {
    assert.equal(getTemplateFileExtension('template.HTML'), '.html');
    assert.equal(getTemplateFileExtension('story.json'), '.json');
});

test('getTemplateFileExtension 对非法文件名返回空字符串', () => {
    assert.equal(getTemplateFileExtension(''), '');
    assert.equal(getTemplateFileExtension('.hidden'), '');
    assert.equal(getTemplateFileExtension('no-extension'), '');
    assert.equal(getTemplateFileExtension('trailing.'), '');
});

test('isValidTemplateExtension 能识别合法与非法扩展名', () => {
    assert.equal(isValidTemplateExtension('template.html'), true);
    assert.equal(isValidTemplateExtension('template.md'), false);
});

test('deriveTemplateName 去掉扩展名并保留主体名称', () => {
    assert.equal(deriveTemplateName('template.html'), 'template');
    assert.equal(deriveTemplateName('  example.json  '), 'example');
});

test('createTemplateRecord 构建标准模板记录', () => {
    const record = createTemplateRecord({
        id: 'tpl-1',
        fileName: 'scene.html',
        template: '<html></html>',
        createdAt: 123,
    });

    assert.deepEqual(record, {
        id: 'tpl-1',
        name: 'scene',
        template: '<html></html>',
        createdAt: 123,
    });
});

test('resolveTemplateSelection 在空值时回退为 null', () => {
    const templates = [{ id: 'a', name: '模板A' }];
    assert.deepEqual(resolveTemplateSelection(templates, ''), {
        activeTemplateId: null,
        template: null,
    });
});

test('resolveTemplateSelection 在命中模板时返回对应模板', () => {
    const templates = [{ id: 'a', name: '模板A' }];
    assert.deepEqual(resolveTemplateSelection(templates, 'a'), {
        activeTemplateId: 'a',
        template: { id: 'a', name: '模板A' },
    });
});

test('resolveTemplateDeletion 删除当前激活模板后回退到第一项', () => {
    const templates = [
        { id: 'a', name: '模板A' },
        { id: 'b', name: '模板B' },
    ];

    assert.deepEqual(resolveTemplateDeletion(templates, 'a', 'a'), {
        templates: [{ id: 'b', name: '模板B' }],
        activeTemplateId: 'b',
        deletedTemplate: { id: 'a', name: '模板A' },
    });
});

test('resolveTemplateDeletion 删除不存在模板时无副作用返回', () => {
    const templates = [{ id: 'a', name: '模板A' }];

    assert.deepEqual(resolveTemplateDeletion(templates, 'a', 'missing'), {
        templates,
        activeTemplateId: 'a',
        deletedTemplate: null,
    });
});

test('normalizeTemplateName 会 trim 输入', () => {
    assert.equal(normalizeTemplateName('  新模板  '), '新模板');
    assert.equal(normalizeTemplateName('   '), '');
});

test('resolveTemplateRename 对空白名称无副作用返回', () => {
    const templates = [{ id: 'a', name: '模板A', template: '<html/>', createdAt: 1 }];

    assert.deepEqual(resolveTemplateRename(templates, 'a', '   '), {
        templates,
        renamed: false,
        normalizedName: '',
    });
});

test('resolveTemplateRename 能正确更新目标模板名称', () => {
    const templates = [{ id: 'a', name: '模板A', template: '<html/>', createdAt: 1 }];

    assert.deepEqual(resolveTemplateRename(templates, 'a', '  新名称  '), {
        templates: [{ id: 'a', name: '新名称', template: '<html/>', createdAt: 1 }],
        renamed: true,
        normalizedName: '新名称',
    });
});

test('resolveTemplateRename 对不存在模板 ID 无副作用返回', () => {
    const templates = [{ id: 'a', name: '模板A', template: '<html/>', createdAt: 1 }];

    assert.deepEqual(resolveTemplateRename(templates, 'missing', '新名称'), {
        templates,
        renamed: false,
        normalizedName: '新名称',
    });
});
