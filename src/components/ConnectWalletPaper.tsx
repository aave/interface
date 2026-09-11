import { Trans } from '@lingui/macro';
import { PaperProps } from '@mui/material';
import { useModal } from 'connectkit';
import { ReactNode } from 'react';

import { EmptyStatePaper } from './EmptyStatePaper';
import { ConnectWalletButton } from './WalletConnection/ConnectWalletButton';

interface ConnectWalletPaperProps extends PaperProps {
  description?: ReactNode;
}

export const ConnectWalletPaper = ({ description, ...rest }: ConnectWalletPaperProps) => {
  const { open } = useModal();

  return (
    <EmptyStatePaper
      loading={open}
      title={<Trans>No Wallet Connected</Trans>}
      description={
        description || (
          <Trans>Connect your wallet to see your supplies, borrowings, and open positions.</Trans>
        )
      }
      {...rest}
    >
      <ConnectWalletButton />
    </EmptyStatePaper>
  );
};
