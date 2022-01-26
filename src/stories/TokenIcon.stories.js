// Button.stories.js|jsx

import React from 'react';

import { TokenIcon } from '../components/primitives/TokenIcon';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'TokenIcon',
  component: TokenIcon,
};

const Template = (args) => <TokenIcon {...args} />;

export const SingleToken = Template.bind({});
SingleToken.args = {
  symbol: 'aave',
  aToken: false,
};

export const aToken = Template.bind({});
aToken.args = {
  symbol: 'aave',
  aToken: true,
};

export const MultiToken = TokenIcon.bind({});
MultiToken.args = {
  symbol: 'weth_aave',
  badgeSymbol: 'uni',
  aToken: false,
};
