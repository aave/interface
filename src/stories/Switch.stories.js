// Button.stories.js|jsx

import { Switch } from '@mui/material';
import React from 'react';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Switch',
  component: Switch,
};

const Template = (args) => <Switch {...args} />;

export const On = Template.bind({});
On.args = {
  checked: true,
  color: 'success',
};

export const Off = Template.bind({});
Off.args = {
  checked: false,
};
