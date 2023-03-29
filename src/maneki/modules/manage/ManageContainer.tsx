/* eslint-disable @typescript-eslint/no-explicit-any */
import { Trans } from '@lingui/macro';
import { Paper } from '@mui/material';
import * as React from 'react';

import { ConnectWalletPaper } from '../../../components/ConnectWalletPaper';
import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';

export const ManagePawContainer = () => {
  const { currentAccount, loading: web3Loading } = useWeb3Context();

  if (!currentAccount || web3Loading) {
    return (
      <ConnectWalletPaper
        loading={web3Loading}
        description={<Trans>Please connect your wallet to claim your airdrop.</Trans>}
      />
    );
  }

  return <Paper>manage PAW</Paper>;
};
