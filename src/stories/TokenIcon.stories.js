// Button.stories.js|jsx

import React from 'react';

import { TokenIcon } from '../components/TokenIcon';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'TokenIcon',
  component: TokenIcon,
};

const Template = (args) => <TokenIcon {...args} />;

export const Aave = Template.bind({});
Aave.args = {
  symbol: 'aave',
  aToken: false,
};

export const aAAVE = Template.bind({});
aAAVE.args = {
  symbol: 'aave',
  aToken: true,
};

export const Weth = Template.bind({});
Weth.args = {
  symbol: 'weth',
  aToken: false,
};
