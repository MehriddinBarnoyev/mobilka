import {Dimensions} from 'react-native';
const {width, height} = Dimensions.get('window');

export const responsiveWidth = (percent: number) => (width * percent) / 100;
export const responsiveHeight = (percent: number) => (height * percent) / 100;
export const isTablet = () => {
  const {height, width} = Dimensions.get('window');
  return Math.min(width, height) >= 768;
};

export const isLandscape = () => {
  const {height, width} = Dimensions.get('window');
  return width > height;
};

export const getResponsiveFontSize = (baseSize: number) => {
  const {width} = Dimensions.get('window');
  return baseSize * (width / 375);
};
