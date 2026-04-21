export function bindButtonEditorEvents($window, dependencies) {
    const {
        getTempTheme,
        applyTempTheme,
        updateButtonPreview,
        icons,
    } = dependencies;

    $window.find('#tamako-button-shape').on('change', function() {
        const tempTheme = getTempTheme();
        if (!tempTheme) return;

        tempTheme.buttonShape = this.value;
        updateButtonPreview();
        applyTempTheme();
    });

    $window.find('#tamako-button-size').on('input', function() {
        const value = parseInt(this.value, 10) / 100;
        $(this).siblings('.tamako-slider-value').text(Math.round(value * 100) + '%');

        const tempTheme = getTempTheme();
        if (!tempTheme) return;

        tempTheme.buttonSize = value;
        updateButtonPreview();
        applyTempTheme();
    });

    const $imageDrop = $window.find('#tamako-button-image-drop');
    const $imageInput = $window.find('#tamako-button-image-input');

    $imageDrop.on('click', () => $imageInput.click());

    $imageDrop.on('dragover', function(e) {
        e.preventDefault();
        $(this).addClass('dragover');
    });

    $imageDrop.on('dragleave drop', function(e) {
        e.preventDefault();
        $(this).removeClass('dragover');
    });

    $imageDrop.on('drop', function(e) {
        e.preventDefault();
        const files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
            handleButtonImageUpload(files[0], dependencies);
        }
    });

    $imageInput.on('change', function() {
        if (this.files.length > 0) {
            handleButtonImageUpload(this.files[0], dependencies);
            this.value = '';
        }
    });

    $window.on('click', '#tamako-button-image-remove', function() {
        const tempTheme = getTempTheme();
        if (!tempTheme) return;

        tempTheme.buttonImage = null;

        $('#tamako-button-image-drop').html(`
            <div class="tamako-button-image-placeholder">
                ${icons.image}
                <span>点击或拖拽上传图片</span>
                <span class="tamako-hint">支持 jpg/png/gif</span>
            </div>
        `);
        $(this).remove();

        updateButtonPreview();
        applyTempTheme();
    });
}

function handleButtonImageUpload(file, dependencies) {
    const {
        getTempTheme,
        applyTempTheme,
        updateButtonPreview,
    } = dependencies;

    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        alert('请上传 jpg、png 或 gif 格式的图片');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const base64 = e.target.result;
        const tempTheme = getTempTheme();
        if (!tempTheme) return;

        tempTheme.buttonImage = base64;

        $('#tamako-button-image-drop').html(
            `<img src="${base64}" class="tamako-button-image-preview" alt="预览">`
        );

        if (!$('#tamako-button-image-remove').length) {
            $('#tamako-button-image-drop').after(
                '<button id="tamako-button-image-remove" class="tamako-btn-remove-image">移除图片</button>'
            );
        }

        updateButtonPreview();
        applyTempTheme();
    };

    reader.onerror = function() {
        alert('图片读取失败，请重试');
    };

    reader.readAsDataURL(file);
}

export function updateButtonPreview(dependencies) {
    const { getTempTheme, icons } = dependencies;
    const tempTheme = getTempTheme();
    if (!tempTheme) return;

    const $preview = $('#tamako-button-live-preview');
    const shape = tempTheme.buttonShape || 'bar';
    const size = tempTheme.buttonSize || 1.0;
    const image = tempTheme.buttonImage;
    const colors = tempTheme.colors;

    $preview.empty().removeAttr('style');

    if (image) {
        if (shape === 'circle') {
            $preview.css({
                'width': `${48 * size}px`,
                'height': `${48 * size}px`,
                'border-radius': '50%',
                'overflow': 'hidden',
                'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)'
            });
            $preview.html(`<img src="${image}" style="width: 100%; height: 100%; object-fit: cover;">`);
        } else {
            $preview.css({
                'display': 'inline-block',
                'border-radius': `${12 * size}px`,
                'overflow': 'hidden',
                'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)',
                'max-width': '200px'
            });
            $preview.html(`<img src="${image}" style="display: block; height: ${40 * size}px; width: auto; object-fit: contain;">`);
        }
        return;
    }

    const gradient = `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;

    if (shape === 'circle') {
        $preview.css({
            'width': `${48 * size}px`,
            'height': `${48 * size}px`,
            'border-radius': '50%',
            'background': gradient,
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'color': '#fff',
            'font-weight': 'bold',
            'font-size': `${16 * size}px`,
            'border': '2px solid rgba(255,255,255,0.3)',
            'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)'
        });
        $preview.html('<span>玉</span>');
        return;
    }

    $preview.css({
        'padding': `${8 * size}px ${14 * size}px`,
        'border-radius': `${12 * size}px`,
        'background': gradient,
        'display': 'inline-flex',
        'align-items': 'center',
        'gap': `${6 * size}px`,
        'color': '#fff',
        'font-weight': '600',
        'font-size': `${14 * size}px`,
        'border': '2px solid rgba(255,255,255,0.3)',
        'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)'
    });
    $preview.html(`<span style="display:flex;align-items:center;width:${18 * size}px;height:${18 * size}px;">${icons.store}</span><span>玉子市场</span>`);
}
