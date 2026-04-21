import { themes } from './constants.js';
import { applyThemeStyles, applyButtonStyles } from './utils.js';
import { saveSetting } from './settings.js';
import { setCurrentTheme } from './state.js';

export function applyTheme(themeName, customData = null) {
    const $window = $('#tamako-market-window');
    const $toggle = $('#tamako-market-toggle');

    $window.removeClass('theme-night theme-custom');
    $toggle.removeClass('theme-night theme-custom');

    if (themeName === 'custom' && customData) {
        setCurrentTheme('custom');
        $window.addClass('theme-custom');
        $toggle.addClass('theme-custom');
        applyThemeStyles(customData, $window, $toggle);
        applyButtonStyles(customData, $toggle);

        const colors = customData.colors;
        $window.find('.tamako-header').css({
            'background': `linear-gradient(135deg, ${colors.primary}E6 0%, ${colors.secondary}E6 100%)`
        });

        saveSetting('theme', 'custom');
        saveSetting('customTheme', customData);
    } else {
        setCurrentTheme('night');
        const preset = themes.night;
        $window.addClass('theme-night');
        $toggle.addClass('theme-night');

        const themeData = {
            colors: {
                primary: preset.primary,
                secondary: preset.secondary,
                bg: preset.bg,
                surface: preset.surface,
                surfaceAlt: preset.surfaceAlt,
                text: preset.text,
                textMuted: preset.textMuted,
                border: preset.border
            },
            opacity: 100,
            fontFamily: 'system',
            buttonShape: 'bar',
            buttonSize: 1.0,
            buttonImage: null
        };
        applyThemeStyles(themeData, $window, $toggle);
        applyButtonStyles(themeData, $toggle);

        $window.find('.tamako-header').css({
            'background': `linear-gradient(135deg, ${preset.primary}E6 0%, ${preset.secondary}E6 100%)`
        });

        saveSetting('theme', 'night');
    }

    $('#tamako-theme-selector').val(themeName);
}
