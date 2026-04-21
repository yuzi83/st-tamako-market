export function createThemeEditorContent({
    themeData,
    icons,
    fontOptions,
    buttonSizeMin,
    buttonSizeMax,
    buttonSizeDefault,
    isMobile,
}) {
    const colors = themeData.colors;

    const fontOptionsHtml = Object.entries(fontOptions).map(([key, font]) =>
        `<option value="${key}" ${themeData.fontFamily === key ? 'selected' : ''}>${font.name}</option>`
    ).join('');

    const buttonShape = themeData.buttonShape || 'bar';
    const buttonSize = themeData.buttonSize || buttonSizeDefault;
    const hasImage = !!themeData.buttonImage;

    return `
        <div class="tamako-theme-editor">
            <div class="tamako-editor-header">
                <span>主题编辑器</span>
                <div class="tamako-editor-actions">
                    <button class="tamako-editor-btn save" title="保存">${icons.check}</button>
                    <button class="tamako-editor-btn reset" title="重置">${icons.reset}</button>
                    <button class="tamako-editor-btn close" title="关闭">${icons.close}</button>
                </div>
            </div>
            
            <div class="tamako-editor-body">
                <div class="tamako-editor-section">
                    <div class="tamako-section-title">颜色设置</div>
                    ${createColorPicker({ colorKey: 'primary', label: '主色', currentColor: colors.primary, icons, isMobile })}
                    ${createColorPicker({ colorKey: 'secondary', label: '辅色', currentColor: colors.secondary, icons, isMobile })}
                    ${createColorPicker({ colorKey: 'surface', label: '表面色', currentColor: colors.surface, icons, isMobile })}
                    ${createColorPicker({ colorKey: 'surfaceAlt', label: '表面色2', currentColor: colors.surfaceAlt, icons, isMobile })}
                    ${createColorPicker({ colorKey: 'text', label: '文字色', currentColor: colors.text, icons, isMobile })}
                    ${createColorPicker({ colorKey: 'textMuted', label: '次要文字', currentColor: colors.textMuted, icons, isMobile })}
                </div>
                
                <div class="tamako-editor-section">
                    <div class="tamako-section-title">样式设置</div>
                    <div class="tamako-slider-row">
                        <label>透明度</label>
                        <input type="range" id="tamako-opacity" min="50" max="100" value="${themeData.opacity}">
                        <span class="tamako-slider-value">${themeData.opacity}%</span>
                    </div>
                </div>
                
                <div class="tamako-editor-section">
                    <div class="tamako-section-title">字体</div>
                    <select id="tamako-font-family" class="tamako-editor-select">
                        ${fontOptionsHtml}
                    </select>
                    <div class="tamako-font-preview">预览：玉子市场 ABC 123</div>
                </div>
                
                <div class="tamako-editor-section">
                    <div class="tamako-section-title">按钮设置</div>
                    
                    <div class="tamako-button-shape-row">
                        <label>形状</label>
                        <select id="tamako-button-shape" class="tamako-editor-select">
                            <option value="bar" ${buttonShape === 'bar' ? 'selected' : ''}>长条形</option>
                            <option value="circle" ${buttonShape === 'circle' ? 'selected' : ''}>圆形</option>
                        </select>
                    </div>
                    
                    <div class="tamako-slider-row">
                        <label>大小</label>
                        <input type="range" id="tamako-button-size" min="${buttonSizeMin * 100}" max="${buttonSizeMax * 100}" value="${buttonSize * 100}">
                        <span class="tamako-slider-value">${Math.round(buttonSize * 100)}%</span>
                    </div>
                    
                    <div class="tamako-button-image-section">
                        <label>自定义图片</label>
                        <div class="tamako-button-image-drop" id="tamako-button-image-drop">
                            ${hasImage
                                ? `<img src="${themeData.buttonImage}" class="tamako-button-image-preview" alt="预览">`
                                : `<div class="tamako-button-image-placeholder">
                                    ${icons.image}
                                    <span>点击或拖拽上传图片</span>
                                    <span class="tamako-hint">支持 jpg/png/gif</span>
                                  </div>`
                            }
                        </div>
                        <input type="file" id="tamako-button-image-input" accept="image/jpeg,image/png,image/gif" style="display:none">
                        ${hasImage ? '<button id="tamako-button-image-remove" class="tamako-btn-remove-image">移除图片</button>' : ''}
                    </div>
                    
                    <div class="tamako-button-preview-container">
                        <label>预览</label>
                        <div class="tamako-button-live-preview" id="tamako-button-live-preview"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="tamako-color-picker-popup" class="tamako-color-picker-popup" style="display: none;">
            <div class="tamako-picker-header">
                <span>选择颜色</span>
                <button class="tamako-picker-close">${icons.close}</button>
            </div>
            <div class="tamako-picker-body">
                <div class="tamako-hue-slider">
                    <input type="range" id="tamako-hue" min="0" max="360" value="0">
                </div>
                <div class="tamako-saturation-lightness">
                    <canvas id="tamako-sl-canvas" width="200" height="150"></canvas>
                    <div class="tamako-sl-cursor"></div>
                </div>
                <div class="tamako-picker-preview">
                    <div class="tamako-preview-color"></div>
                    <input type="text" class="tamako-preview-hex" value="#FFFFFF">
                </div>
                <div class="tamako-picker-actions">
                    ${isMobile ? '' : `<button class="tamako-picker-eyedropper">${icons.eyedropper} 吸取</button>`}
                    <button class="tamako-picker-confirm">确定</button>
                </div>
            </div>
        </div>
    `;
}

function createColorPicker({ colorKey, label, currentColor, icons, isMobile }) {
    const id = `tamako-color-${colorKey}`;
    const eyedropperBtn = isMobile
        ? ''
        : `<button class="tamako-eyedropper-btn" data-color-key="${colorKey}" title="吸取颜色">${icons.eyedropper}</button>`;

    return `
        <div class="tamako-color-row">
            <label for="${id}">${label}</label>
            <div class="tamako-color-input-group">
                <div class="tamako-color-preview" data-color-key="${colorKey}" style="background: ${currentColor}"></div>
                <input type="text" id="${id}" class="tamako-color-hex" data-color-key="${colorKey}" value="${currentColor}" placeholder="#FFFFFF">
                ${eyedropperBtn}
            </div>
        </div>
    `;
}
