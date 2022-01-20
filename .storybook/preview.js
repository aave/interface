import * as NextImage from 'next/image';
import { AppGlobalStyles } from '../src/layouts/AppGlobalStyles';
import { addDecorator } from '@storybook/react';
import React from 'react';
import { LanguageProvider } from '../src/libs/LanguageProvider';
// Fix Next.js Image component at Storybook
const OriginalNextImage = NextImage.default;

Object.defineProperty(NextImage, 'default', {
  configurable: true,
  value: (props) => <OriginalNextImage {...props} unoptimized />,
});

// Apply global styles
addDecorator((storyFn) => (
  <LanguageProvider>
    <AppGlobalStyles>{storyFn()}</AppGlobalStyles>
  </LanguageProvider>
));

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
