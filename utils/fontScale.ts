import { PixelRatio } from 'react-native';

export const fontScale = (size: number) => PixelRatio.getFontScale() * size;
