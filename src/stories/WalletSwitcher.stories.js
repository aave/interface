import React from 'react';

import { MarketSwitcher } from '../components/MarketSwitcher/MarketSwitcher';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'MarketSwitcher',
  component: MarketSwitcher,
};

const Template = (args) => <MarketSwitcher {...args} />;

export const Switcher = Template.bind({});
