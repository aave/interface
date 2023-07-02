/* eslint-disable @typescript-eslint/no-explicit-any */
import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import * as React from 'react';
import ManekiLoadingPaper from 'src/maneki/components/ManekiLoadingPaper';

import { ConnectWalletPaper } from '../../../components/ConnectWalletPaper';
import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { ManageMainActions } from './ManageMainActions';
import { ManageQuickActions } from './ManageQuickActions';

export const ManagePawContainer = () => {
  const { currentAccount, loading: web3Loading, chainId } = useWeb3Context();

  if (!currentAccount) {
    return (
      <ConnectWalletPaper
        loading={web3Loading}
        description={<Trans>Please connect your wallet to manage your PAW.</Trans>}
      />
    );
  }

  if (chainId != 97) {
    return <ManekiLoadingPaper description="Please connect to BNB Testnet" switchNetwork />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: '32px' }}>
      {/* QuickActions */}
      <ManageQuickActions />

      {/* Main actions  */}
      <ManageMainActions />
    </Box>
  );
};
