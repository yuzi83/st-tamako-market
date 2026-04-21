let isDraggingSL = false;

export function initColorPicker(dependencies) {
    const { isMobileDevice, getPickerState, updatePickerState, hexToRgb, rgbToHsl } = dependencies;
    const $popup = $('#tamako-color-picker-popup');

    $popup.find('.tamako-picker-close').on('click', () => closeColorPicker(dependencies));
    $popup.find('.tamako-picker-confirm').on('click', () => confirmColorPicker(dependencies));

    if (!isMobileDevice()) {
        $popup.find('.tamako-picker-eyedropper').on('click', () => {
            closeColorPicker(dependencies);
            startEyedropper(getPickerState().colorKey, dependencies);
        });
    }

    $popup.find('#tamako-hue').on('input', function() {
        updatePickerState({ hue: parseInt(this.value, 10) });
        updateSLCanvas(dependencies);
        updatePickerPreview(dependencies);
    });

    const canvas = document.getElementById('tamako-sl-canvas');
    if (canvas) {
        canvas.addEventListener('click', (e) => handleSLCanvasClick(e, dependencies));
        canvas.addEventListener('mousedown', (e) => startSLDrag(e, dependencies));
        canvas.addEventListener('touchstart', (e) => startSLDragTouch(e, dependencies), { passive: false });
    }

    $popup.find('.tamako-preview-hex').on('input', function() {
        let value = $(this).val().trim();
        if (!value.startsWith('#')) value = '#' + value;
        if (!/^#[A-Fa-f0-9]{6}$/.test(value)) return;

        const rgb = hexToRgb(value);
        if (!rgb) return;

        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        updatePickerState({
            hue: hsl.h,
            saturation: hsl.s,
            lightness: hsl.l,
        });
        $('#tamako-hue').val(getPickerState().hue);
        updateSLCanvas(dependencies);
        updateSLCursor(dependencies);
        $popup.find('.tamako-preview-color').css('background', value);
    });
}

export function openColorPicker(colorKey, dependencies) {
    const { updatePickerState, getPickerState, hexToRgb, rgbToHsl } = dependencies;
    const $popup = $('#tamako-color-picker-popup');

    updatePickerState({ colorKey });

    const currentColor = $(`.tamako-color-hex[data-color-key="${colorKey}"]`).val() || '#9370DB';
    const rgb = hexToRgb(currentColor);

    if (rgb) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        updatePickerState({
            hue: hsl.h,
            saturation: hsl.s,
            lightness: hsl.l,
        });
    }

    $('#tamako-hue').val(getPickerState().hue);
    updateSLCanvas(dependencies);
    updateSLCursor(dependencies);
    updatePickerPreview(dependencies);

    $popup.show();
}

export function closeColorPicker(dependencies) {
    const { updatePickerState } = dependencies;
    $('#tamako-color-picker-popup').hide();
    updatePickerState({ colorKey: null });
}

function confirmColorPicker(dependencies) {
    const {
        getPickerState,
        updateTempColor,
        updateButtonPreview,
        applyTempTheme,
    } = dependencies;

    const hex = $('#tamako-color-picker-popup .tamako-preview-hex').val();
    const pickerState = getPickerState();

    if (pickerState.colorKey && /^#[A-Fa-f0-9]{6}$/i.test(hex)) {
        $(`.tamako-color-preview[data-color-key="${pickerState.colorKey}"]`).css('background', hex);
        $(`.tamako-color-hex[data-color-key="${pickerState.colorKey}"]`).val(hex);
        updateTempColor(pickerState.colorKey, hex);
        updateButtonPreview();
        applyTempTheme();
    }

    closeColorPicker(dependencies);
}

function updateSLCanvas(dependencies) {
    const { getPickerState, hslToRgb } = dependencies;
    const canvas = document.getElementById('tamako-sl-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const pickerState = getPickerState();

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const s = (x / width) * 100;
            const l = 100 - (y / height) * 100;
            const rgb = hslToRgb(pickerState.hue, s, l);
            ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

function updateSLCursor(dependencies) {
    const { getPickerState } = dependencies;
    const $cursor = $('.tamako-sl-cursor');
    const canvas = document.getElementById('tamako-sl-canvas');
    if (!canvas || !$cursor.length) return;

    const pickerState = getPickerState();
    const x = (pickerState.saturation / 100) * canvas.width;
    const y = ((100 - pickerState.lightness) / 100) * canvas.height;

    $cursor.css({ left: x + 'px', top: y + 'px' });
}

function updatePickerPreview(dependencies) {
    const { getPickerState, hslToRgb, rgbToHex } = dependencies;
    const pickerState = getPickerState();
    const rgb = hslToRgb(pickerState.hue, pickerState.saturation, pickerState.lightness);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    $('#tamako-color-picker-popup .tamako-preview-color').css('background', hex);
    $('#tamako-color-picker-popup .tamako-preview-hex').val(hex);
}

function handleSLCanvasClick(e, dependencies) {
    const { updatePickerState } = dependencies;
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    updatePickerState({
        saturation: (x / canvas.width) * 100,
        lightness: 100 - (y / canvas.height) * 100,
    });

    updateSLCursor(dependencies);
    updatePickerPreview(dependencies);
}

function startSLDrag(e, dependencies) {
    const { updatePickerState } = dependencies;
    isDraggingSL = true;
    handleSLCanvasClick(e, dependencies);

    const moveHandler = (event) => {
        if (!isDraggingSL) return;
        const canvas = document.getElementById('tamako-sl-canvas');
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.max(0, Math.min(event.clientX - rect.left, canvas.width));
        const y = Math.max(0, Math.min(event.clientY - rect.top, canvas.height));

        updatePickerState({
            saturation: (x / canvas.width) * 100,
            lightness: 100 - (y / canvas.height) * 100,
        });

        updateSLCursor(dependencies);
        updatePickerPreview(dependencies);
    };

    const upHandler = () => {
        isDraggingSL = false;
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
}

function startSLDragTouch(e, dependencies) {
    const { updatePickerState } = dependencies;
    e.preventDefault();
    isDraggingSL = true;

    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, canvas.width));
    const y = Math.max(0, Math.min(touch.clientY - rect.top, canvas.height));

    updatePickerState({
        saturation: (x / canvas.width) * 100,
        lightness: 100 - (y / canvas.height) * 100,
    });

    updateSLCursor(dependencies);
    updatePickerPreview(dependencies);

    const moveHandler = (event) => {
        if (!isDraggingSL) return;
        event.preventDefault();

        const moveTouch = event.touches[0];
        const nextX = Math.max(0, Math.min(moveTouch.clientX - rect.left, canvas.width));
        const nextY = Math.max(0, Math.min(moveTouch.clientY - rect.top, canvas.height));

        updatePickerState({
            saturation: (nextX / canvas.width) * 100,
            lightness: 100 - (nextY / canvas.height) * 100,
        });

        updateSLCursor(dependencies);
        updatePickerPreview(dependencies);
    };

    const endHandler = () => {
        isDraggingSL = false;
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('touchend', endHandler);
    };

    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('touchend', endHandler);
}

export function startEyedropper(colorKey, dependencies) {
    const {
        isMobileDevice,
        setEyedropperActive,
        setCurrentEditingColor,
    } = dependencies;

    if (isMobileDevice()) return;

    setEyedropperActive(true);
    setCurrentEditingColor(colorKey);

    if (window.EyeDropper) {
        useNativeEyeDropper(dependencies);
        return;
    }

    const $window = $('#tamako-market-window');
    const $toggle = $('#tamako-market-toggle');

    $window.css('visibility', 'hidden');
    $toggle.css('visibility', 'hidden');

    $('body').addClass('tamako-eyedropper-mode');

    const $indicator = $('<div class="tamako-eyedropper-indicator">点击任意位置吸取颜色，ESC取消</div>');
    $('body').append($indicator);

    setTimeout(() => {
        $(document).on('click.eyedropper', (e) => handleEyedropperClick(e, dependencies));
        $(document).on('keydown.eyedropper', (e) => handleEyedropperKeydown(e, dependencies));
        $(document).on('mousemove.eyedropper', (e) => handleEyedropperMove(e, dependencies));
    }, 50);
}

async function useNativeEyeDropper(dependencies) {
    const {
        getCurrentEditingColor,
        updateTempColor,
        updateButtonPreview,
        applyTempTheme,
        setEyedropperActive,
        setCurrentEditingColor,
    } = dependencies;

    try {
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        const currentEditingColor = getCurrentEditingColor();

        if (result.sRGBHex && currentEditingColor) {
            const color = result.sRGBHex;
            $(`.tamako-color-preview[data-color-key="${currentEditingColor}"]`).css('background', color);
            $(`.tamako-color-hex[data-color-key="${currentEditingColor}"]`).val(color);
            updateTempColor(currentEditingColor, color);
            updateButtonPreview();
            applyTempTheme();
        }
    } catch (err) {
        if (err?.name !== 'AbortError') {
            console.debug('[玉子市场] 吸管工具:', err?.message || '已取消');
        }
    } finally {
        setEyedropperActive(false);
        setCurrentEditingColor(null);
    }
}

function stopEyedropper(dependencies) {
    const { setEyedropperActive, setCurrentEditingColor } = dependencies;

    setEyedropperActive(false);
    setCurrentEditingColor(null);

    $('body').removeClass('tamako-eyedropper-mode');
    $('.tamako-eyedropper-indicator, .tamako-eyedropper-preview').remove();

    $('#tamako-market-window').css('visibility', 'visible');
    $('#tamako-market-toggle').css('visibility', 'visible');

    $(document).off('click.eyedropper');
    $(document).off('keydown.eyedropper');
    $(document).off('mousemove.eyedropper');
}

function getColorAtPoint(x, y, dependencies) {
    const { parseColor, rgbToHex } = dependencies;
    const element = document.elementFromPoint(x, y);
    if (!element) return null;

    const computedStyle = window.getComputedStyle(element);

    let color = computedStyle.backgroundColor;
    if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
        const rgb = parseColor(color);
        if (rgb) return rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    color = computedStyle.color;
    if (color) {
        const rgb = parseColor(color);
        if (rgb && !(rgb.r === 0 && rgb.g === 0 && rgb.b === 0)) {
            return rgbToHex(rgb.r, rgb.g, rgb.b);
        }
    }

    let parent = element.parentElement;
    let depth = 0;
    while (parent && depth < 10) {
        const parentStyle = window.getComputedStyle(parent);
        color = parentStyle.backgroundColor;
        if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
            const rgb = parseColor(color);
            if (rgb) return rgbToHex(rgb.r, rgb.g, rgb.b);
        }
        parent = parent.parentElement;
        depth++;
    }

    return '#808080';
}

function handleEyedropperClick(e, dependencies) {
    const {
        getCurrentEditingColor,
        updateTempColor,
        updateButtonPreview,
        applyTempTheme,
    } = dependencies;

    e.preventDefault();
    e.stopPropagation();

    const color = getColorAtPoint(e.clientX, e.clientY, dependencies);
    const currentEditingColor = getCurrentEditingColor();

    if (color && currentEditingColor) {
        $(`.tamako-color-preview[data-color-key="${currentEditingColor}"]`).css('background', color);
        $(`.tamako-color-hex[data-color-key="${currentEditingColor}"]`).val(color);
        updateTempColor(currentEditingColor, color);
        updateButtonPreview();
        applyTempTheme();
    }

    stopEyedropper(dependencies);
}

function handleEyedropperKeydown(e, dependencies) {
    if (e.key === 'Escape') {
        stopEyedropper(dependencies);
    }
}

function handleEyedropperMove(e, dependencies) {
    let $preview = $('.tamako-eyedropper-preview');
    if (!$preview.length) {
        $preview = $('<div class="tamako-eyedropper-preview"><div class="ep-color"></div><div class="ep-value"></div></div>');
        $('body').append($preview);
    }

    const color = getColorAtPoint(e.clientX, e.clientY, dependencies);

    let left = e.clientX + 20;
    let top = e.clientY + 20;

    if (left + 120 > window.innerWidth) left = e.clientX - 130;
    if (top + 40 > window.innerHeight) top = e.clientY - 50;

    $preview.css({ left: left + 'px', top: top + 'px' });
    $preview.find('.ep-color').css('background', color || '#808080');
    $preview.find('.ep-value').text(color || '---');
}
