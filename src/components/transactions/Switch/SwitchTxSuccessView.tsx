import { ChainIdToNetwork } from '@aave/contract-helpers';
import { ArrowRightIcon, ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { ExternalTokenIcon } from 'src/components/primitives/TokenIcon';
import { useSwitchProvider } from 'src/hooks/switch/useSwitchProvider';

import { BaseCancelledView } from '../FlowCommons/BaseCancelled';
import { BaseSuccessView } from '../FlowCommons/BaseSuccess';
import { BaseWaitingView } from '../FlowCommons/BaseWaiting';
import { getOrderStatus, isOrderCancelled, isOrderFilled } from './cowprotocol.helpers';
import { SwitchProvider } from './switch.types';

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
  provider: SwitchProvider;
  chainId: number;
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
  provider,
  chainId,
}: SwitchTxSuccessViewProps) => {
  const switchProvider = useSwitchProvider({ chainId: chainId });

  // Do polling each 10 seconds until the order get's filled
  const [orderStatus, setOrderStatus] = useState<'succeed' | 'failed' | 'open'>('open');

  // Poll the order status
  useEffect(() => {
    const interval = setInterval(() => {
      if (switchProvider === 'cowprotocol' && txHash) {
        getOrderStatus(txHash, chainId)
          .then((status) => {
            if (isOrderFilled(status)) {
              setOrderStatus('succeed');
            } else if (isOrderCancelled(status)) {
              setOrderStatus('failed');
            } else {
              setOrderStatus('open');
            }
          })
          .catch(console.error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [txHash]);

  const View = useMemo(() => {
    if (provider === 'cowprotocol' && orderStatus === 'open') {
      return BaseWaitingView;
    } else if (provider === 'cowprotocol' && orderStatus === 'failed') {
      return BaseCancelledView;
    }
    return BaseSuccessView; // Default case
  }, [orderStatus, provider]);

  return (
    <View txHash={txHash} hideTx={provider === 'cowprotocol'}>
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
        <Typography mb={2}>
          {provider === 'cowprotocol' ? (
            <>
              {orderStatus === 'open' ? (
                <Trans>
                  You&apos;ve successfully submitted an order.
                  <br /> Please wait for it to be filled.
                </Trans>
              ) : orderStatus === 'failed' ? (
                <Trans>The order has been cancelled.</Trans>
              ) : (
                <Trans>The order has been filled.</Trans>
              )}
              <br />
              {txHash && (
                <>
                  You can see the details{' '}
                  <Link
                    underline="always"
                    href={`https://explorer.cow.fi/${
                      chainId == 1 ? '' : ChainIdToNetwork[chainId] + '/'
                    }orders/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    here
                    <SvgIcon sx={{ ml: '2px', fontSize: '11px' }}>
                      <ExternalLinkIcon />
                    </SvgIcon>
                  </Link>
                  <br />
                </>
              )}
              {!txHash && <Trans>Details will be available soon.</Trans>}
            </>
          ) : (
            <Trans>You&apos;ve successfully switched tokens.</Trans>
          )}
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
    </View>
  );
};
