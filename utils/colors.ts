// Color palette for light and dark themes

export const Colors = {
  light: {
    // Backgrounds
    background: '#F2F2F7',
    cardBackground: 'rgba(255, 255, 255, 0.9)',
    inputBackground: '#fff',

    // Text
    text: '#333',
    textSecondary: '#666',
    textTertiary: '#999',
    textSubtle: '#aaa',

    // Borders
    border: '#ddd',
    borderLight: '#eee',

    // Buttons & Interactive
    pickerButtonBackground: '#f0f0f0',
    toggleBackground: '#fff',
    toggleActiveBackground: '#333',
    toggleActiveBorder: '#333',

    // Glass effects
    glassBackground: 'rgba(255, 255, 255, 0.5)',
    glassBorder: 'rgba(255, 255, 255, 0.8)',
    glassButtonBorder: 'rgba(255, 255, 255, 0.3)',

    // System colors (same in both themes)
    primary: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    disabled: '#8E8E93',

    // Shadows
    shadowColor: '#000',

    // BlurView tint
    blurTint: 'light' as const,

    // Image background overlay (1.0 = no darkening)
    imageOverlay: 'transparent',
  },
  dark: {
    // Backgrounds
    background: '#000000',
    cardBackground: 'rgba(28, 28, 30, 0.9)',
    inputBackground: '#1c1c1e',

    // Text
    text: '#ffffff',
    textSecondary: '#ababab',
    textTertiary: '#8e8e93',
    textSubtle: '#636366',

    // Borders
    border: '#3a3a3c',
    borderLight: '#2c2c2e',

    // Buttons & Interactive
    pickerButtonBackground: '#2c2c2e',
    toggleBackground: '#1c1c1e',
    toggleActiveBackground: '#ffffff',
    toggleActiveBorder: '#ffffff',

    // Glass effects
    glassBackground: 'rgba(50, 50, 50, 0.7)',
    glassBorder: 'rgba(100, 100, 100, 0.5)',
    glassButtonBorder: 'rgba(100, 100, 100, 0.3)',

    // System colors (same in both themes)
    primary: '#0A84FF',
    success: '#32D74B',
    warning: '#FF9F0A',
    danger: '#FF453A',
    disabled: '#636366',

    // Shadows
    shadowColor: '#000',

    // BlurView tint
    blurTint: 'dark' as const,

    // Image background overlay
    imageOverlay: 'rgba(0, 0, 0, 0.4)',
  },
};

export type ThemeColors = Omit<typeof Colors.light, 'blurTint'> & { blurTint: 'light' | 'dark' };
export type ColorScheme = 'light' | 'dark' | 'system';
