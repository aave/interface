import { ArrowRightIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ExternalTokenIcon } from 'src/components/primitives/TokenIcon';

import { BaseSuccessView } from '../FlowCommons/BaseSuccess';

export type SwitchTxSuccessViewProps = {
  txHash?: string;
  amount: string;
  symbol: string;
  iconSymbol: string;
  outAmount: string;
  outSymbol: string;
  outIconSymbol: string;
  iconUri?: string;
  outIconUri?: string;
};

export const SwitchTxSuccessView = ({
  txHash,
  amount,
  symbol,
  iconSymbol,
  outAmount,
  outSymbol,
  outIconSymbol,
  iconUri,
  outIconUri,
}: SwitchTxSuccessViewProps) => {
  return (
    <BaseSuccessView txHash={txHash}>
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Typography>
          <Trans>You&apos;ve successfully switched tokens.</Trans>
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mt: 3,
          }}
        >
          <ExternalTokenIcon sx={{ fontSize: '20px' }} logoURI={iconUri} symbol={iconSymbol} />
          <FormattedNumber value={Number(amount)} compact variant="main14" />
          <Typography variant="secondary14">{symbol}</Typography>
          <SvgIcon sx={{ fontSize: '14px' }}>
            <ArrowRightIcon fontSize="14px" />
          </SvgIcon>
          <ExternalTokenIcon
            sx={{ fontSize: '20px' }}
            logoURI={outIconUri}
            symbol={outIconSymbol}
          />
          <FormattedNumber value={Number(outAmount)} variant="main14" />
          <Typography variant="secondary14">{outSymbol}</Typography>
        </Box>
      </Box>
    </BaseSuccessView>
  );
};
