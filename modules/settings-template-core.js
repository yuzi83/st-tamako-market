// modules/settings-template-core.js
/**
 * 玉子市场 - 模板管理核心纯逻辑
 *
 * 目标：抽离不依赖 DOM / jQuery 的模板状态规则，
 * 为自动化测试和后续维护提供稳定边界。
 */

export const VALID_TEMPLATE_EXTENSIONS = Object.freeze(['.html', '.htm', '.json', '.txt']);

/**
 * 获取模板文件扩展名。
 *
 * @param {string} fileName
 * @returns {string}
 */
export function getTemplateFileExtension(fileName) {
    if (typeof fileName !== 'string') return '';

    const trimmed = fileName.trim();
    if (!trimmed) return '';

    const lastDotIndex = trimmed.lastIndexOf('.');
    if (lastDotIndex <= 0 || lastDotIndex === trimmed.length - 1) {
        return '';
    }

    return trimmed.slice(lastDotIndex).toLowerCase();
}

/**
 * 判断模板文件扩展名是否合法。
 *
 * @param {string} fileName
 * @param {readonly string[]} [validExtensions=VALID_TEMPLATE_EXTENSIONS]
 * @returns {boolean}
 */
export function isValidTemplateExtension(fileName, validExtensions = VALID_TEMPLATE_EXTENSIONS) {
    return validExtensions.includes(getTemplateFileExtension(fileName));
}

/**
 * 根据文件名推导模板显示名称。
 *
 * @param {string} fileName
 * @returns {string}
 */
export function deriveTemplateName(fileName) {
    if (typeof fileName !== 'string') return '';

    const trimmed = fileName.trim();
    if (!trimmed) return '';

    const normalized = trimmed.replace(/\.[^.]+$/, '');
    return normalized || trimmed;
}

/**
 * 构建模板记录。
 *
 * @param {{
 *   id: string,
 *   fileName: string,
 *   template: string,
 *   createdAt?: number
 * }} options
 * @returns {{ id: string, name: string, template: string, createdAt: number }}
 */
export function createTemplateRecord({ id, fileName, template, createdAt = Date.now() }) {
    return {
        id,
        name: deriveTemplateName(fileName),
        template,
        createdAt,
    };
}

/**
 * 计算模板切换结果。
 * 保持当前宿主逻辑兼容：空值会切回 null；非空值即使暂未命中模板，也保留该 id。
 *
 * @param {{ id: string, name: string }[]} templates
 * @param {string | null | undefined} templateId
 * @returns {{ activeTemplateId: string | null, template: { id: string, name: string } | null }}
 */
export function resolveTemplateSelection(templates, templateId) {
    const nextTemplates = Array.isArray(templates) ? templates : [];
    const activeTemplateId = templateId || null;
    const template = activeTemplateId
        ? nextTemplates.find(item => item.id === activeTemplateId) || null
        : null;

    return {
        activeTemplateId,
        template,
    };
}

/**
 * 计算删除模板后的状态。
 *
 * @param {{ id: string, name: string }[]} templates
 * @param {string | null | undefined} activeTemplateId
 * @param {string} templateId
 * @returns {{
 *   templates: { id: string, name: string }[],
 *   activeTemplateId: string | null,
 *   deletedTemplate: { id: string, name: string } | null
 * }}
 */
export function resolveTemplateDeletion(templates, activeTemplateId, templateId) {
    const currentTemplates = Array.isArray(templates) ? templates : [];
    const deletedTemplate = currentTemplates.find(item => item.id === templateId) || null;
    if (!deletedTemplate) {
        return {
            templates: currentTemplates,
            activeTemplateId: activeTemplateId || null,
            deletedTemplate: null,
        };
    }

    const nextTemplates = currentTemplates.filter(item => item.id !== templateId);
    const nextActiveTemplateId = activeTemplateId === templateId
        ? nextTemplates[0]?.id ?? null
        : (activeTemplateId || null);

    return {
        templates: nextTemplates,
        activeTemplateId: nextActiveTemplateId,
        deletedTemplate,
    };
}

/**
 * 标准化模板名称。
 *
 * @param {string} value
 * @returns {string}
 */
export function normalizeTemplateName(value) {
    if (typeof value !== 'string') return '';
    return value.trim();
}

/**
 * 计算模板重命名结果。
 *
 * @param {{ id: string, name: string, template: string, createdAt: number }[]} templates
 * @param {string} templateId
 * @param {string} newName
 * @returns {{
 *   templates: { id: string, name: string, template: string, createdAt: number }[],
 *   renamed: boolean,
 *   normalizedName: string
 * }}
 */
export function resolveTemplateRename(templates, templateId, newName) {
    const currentTemplates = Array.isArray(templates) ? templates : [];
    const normalizedName = normalizeTemplateName(newName);
    if (!normalizedName) {
        return {
            templates: currentTemplates,
            renamed: false,
            normalizedName: '',
        };
    }

    let renamed = false;
    const nextTemplates = currentTemplates.map(item => {
        if (item.id !== templateId) {
            return item;
        }

        renamed = true;
        return {
            ...item,
            name: normalizedName,
        };
    });

    return {
        templates: renamed ? nextTemplates : currentTemplates,
        renamed,
        normalizedName,
    };
}
