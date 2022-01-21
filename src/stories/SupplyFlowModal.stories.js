/* eslint-disable import/no-anonymous-default-export */
// Button.stories.js|jsx

import { Button } from '@mui/material';
import React from 'react';

import { useAaveModal } from '../components/AaveModal/useAaveModal';
import { SupplyFlowModal } from '../flows/SupplyFlowModal/SupplyFlowModal';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'SupplyFlowModal',
  component: SupplyFlowModal,
};

const Template = (args) => {
  const [open, setOpen] = useAaveModal(true);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);
  return (
    <>
      <Button onClick={handleOpen}>Open Supply Flow Modal</Button>
      <SupplyFlowModal {...args} open={open} onClose={handleClose} />
    </>
  );
};

//👇 Each story then reuses that template
export const Example = Template.bind({});

Example.args = {
  tokenAddress: true,
  supplyRewards: [{ tokenName: 'stkAAVE', tokenIcon: 'aave', apy: '6.78' }],
  supplyApy: '4.6',
  healthFactor: '3.2',
  balance: '12340',
  tokenSymbol: 'dai',
};
