import { ChainIdToNetwork } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Divider, Typography } from '@mui/material';
import { BigNumber } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ExternalTokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip, TextWithTooltipProps } from 'src/components/TextWithTooltip';
import { useSwitchProvider } from 'src/hooks/switch/useSwitchProvider';
import { useCowOrderToast } from 'src/hooks/useCowOrderToast';
import { parseUnits } from 'viem';

import { BaseCancelledView } from '../FlowCommons/BaseCancelled';
import { BaseSuccessView } from '../FlowCommons/BaseSuccess';
import { BaseWaitingView } from '../FlowCommons/BaseWaiting';
import { getOrder, isOrderCancelled, isOrderFilled, isOrderLoading } from './cowprotocol.helpers';
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
  destDecimals: number;
};

export const SwitchWithSurplusTooltip = ({
  surplus,
  surplusPercent,
  baseAmount,
  ...rest
}: TextWithTooltipProps & { surplus: number; surplusPercent: number; baseAmount: number }) => {
  return (
    <TextWithTooltip {...rest}>
      <>
        <Typography>
          Base: <FormattedNumber value={baseAmount} compact variant="main14" />
        </Typography>
        <Typography>
          Surplus: <FormattedNumber value={surplus} visibleDecimals={2} compact variant="main14" />{' '}
          (
          <FormattedNumber
            value={surplusPercent}
            percent={true}
            visibleDecimals={2}
            compact
            variant="main14"
          />
          )
        </Typography>
      </>
    </TextWithTooltip>
  );
};

export const SwitchTxSuccessView = ({
  txHash: txHashOrOrderId,
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
  destDecimals,
}: SwitchTxSuccessViewProps) => {
  const switchProvider = useSwitchProvider({ chainId: chainId });
  const { trackOrder } = useCowOrderToast();

  // Do polling each 10 seconds until the order get's filled
  const [orderStatus, setOrderStatus] = useState<'succeed' | 'failed' | 'open'>('open');
  const [surplus, setSurplus] = useState<bigint | undefined>(undefined);

  // Start tracking the order when the component mounts
  useEffect(() => {
    if (switchProvider === 'cowprotocol' && txHashOrOrderId) {
      trackOrder(txHashOrOrderId, chainId);
    }
  }, [txHashOrOrderId, chainId, switchProvider, trackOrder]);

  // Poll the order status for UI updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (switchProvider === 'cowprotocol' && txHashOrOrderId) {
        getOrder(txHashOrOrderId, chainId)
          .then((order) => {
            if (isOrderFilled(order.status)) {
              setOrderStatus('succeed');
              setSurplus(
                BigNumber.from(order.executedBuyAmount)
                  .sub(BigNumber.from(parseUnits(outAmount, destDecimals)))
                  .toBigInt()
              );
            } else if (isOrderCancelled(order.status)) {
              setOrderStatus('failed');
            } else if (isOrderLoading(order.status)) {
              setOrderStatus('open');
            }
          })
          .catch(console.error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [txHashOrOrderId, chainId, switchProvider, outAmount, destDecimals]);

  const View = useMemo(() => {
    if (provider === 'cowprotocol' && orderStatus === 'open') {
      return BaseWaitingView;
    } else if (provider === 'cowprotocol' && orderStatus === 'failed') {
      return BaseCancelledView;
    }
    return BaseSuccessView; // Default case
  }, [orderStatus, provider]);

  const surplusDisplay =
    surplus && surplus > 0
      ? `Includes +${Number(normalize(surplus.toString(), destDecimals)).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })} ${outSymbol} Surplus`
      : undefined;

  const customExplorerLink = useMemo(() => {
    return provider === 'cowprotocol'
      ? `https://explorer.cow.fi/${
          chainId == 1 ? '' : ChainIdToNetwork[chainId] + '/'
        }orders/${txHashOrOrderId}`
      : undefined;
  }, [provider, chainId, txHashOrOrderId]);

  const customExplorerLinkText = useMemo(() => {
    return provider === 'cowprotocol' ? 'View details' : undefined;
  }, [provider]);

  return (
    <View
      txHash={txHashOrOrderId}
      customExplorerLink={customExplorerLink}
      customExplorerLinkText={customExplorerLinkText}
      hideTx={provider == 'cowprotocol' && !txHashOrOrderId}
    >
      <Box display="flex" flexDirection="column" alignItems="center" mt={2} mb={3}>
        <Typography color="text.secondary">
          {provider === 'cowprotocol' ? (
            <>
              {orderStatus === 'open' ? (
                <Trans>You&apos;ve successfully submitted an order.</Trans>
              ) : orderStatus === 'failed' ? (
                <Trans>The order could&apos;t be filled.</Trans>
              ) : (
                <Trans>You&apos;ve successfully switched tokens.</Trans>
              )}
            </>
          ) : (
            <Trans>You&apos;ve successfully switched tokens.</Trans>
          )}
        </Typography>
      </Box>

      <Box
        sx={{
          background: 'background.default',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          p: 3,
          mb: 4,
          width: '80%',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography color="text.secondary">Sent</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <ExternalTokenIcon symbol={iconSymbol} logoURI={iconUri} sx={{ fontSize: 20 }} />
            <Typography fontWeight={600}>
              {Number(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
            </Typography>
            <Typography fontWeight={600} sx={{ color: 'text.secondary' }}>
              {symbol}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography color="text.secondary">Received</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <ExternalTokenIcon symbol={outIconSymbol} logoURI={outIconUri} sx={{ fontSize: 20 }} />
            <Typography fontWeight={600}>
              {Number(outAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </Typography>
            <Typography fontWeight={600} sx={{ color: 'text.secondary' }}>
              {outSymbol}
            </Typography>
          </Box>
        </Box>
        {surplusDisplay && (
          <Typography
            variant="helperText"
            fontWeight={500}
            sx={{ float: 'right', color: 'text.secondary' }}
            mt={0.5}
          >
            {surplusDisplay}
          </Typography>
        )}
      </Box>
      {!txHashOrOrderId && <Trans>Details will be available soon.</Trans>}

    </View>
  );
};
