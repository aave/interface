import * as NextImage from 'next/image';
import { AppGlobalStyles } from '../src/layouts/AppGlobalStyles';
import { addDecorator } from '@storybook/react';
import React from 'react';
import { LanguageProvider } from '../src/libs/LanguageProvider';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../src/createEmotionCache';

const clientSideEmotionCache = createEmotionCache();

import '../public/fonts/inter/inter.css';

// Fix Next.js Image component at Storybook
const OriginalNextImage = NextImage.default;

Object.defineProperty(NextImage, 'default', {
  configurable: true,
  value: (props) => <OriginalNextImage {...props} unoptimized />,
});

// Apply global styles
addDecorator((storyFn) => (
  <CacheProvider value={clientSideEmotionCache}>
    <LanguageProvider>
      <AppGlobalStyles>{storyFn()}</AppGlobalStyles>
    </LanguageProvider>
  </CacheProvider>
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
