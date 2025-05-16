import { ChainIdToNetwork } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Order } from '@cowprotocol/cow-sdk';
import { ArrowRightIcon, ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';
import { BigNumber } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { ExternalTokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip, TextWithTooltipProps } from 'src/components/TextWithTooltip';
import { useSwitchProvider } from 'src/hooks/switch/useSwitchProvider';
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

  // Do polling each 10 seconds until the order get's filled
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [orderStatus, setOrderStatus] = useState<'succeed' | 'failed' | 'open'>('open');
  const [surplus, setSurplus] = useState<bigint | undefined>(undefined);
  const [surplusPercent, setSurplusPercent] = useState<number | undefined>(undefined);

  // Poll the order status
  useEffect(() => {
    const interval = setInterval(() => {
      if (switchProvider === 'cowprotocol' && txHashOrOrderId) {
        getOrder(txHashOrOrderId, chainId)
          .then((order) => {
            setOrder(order);
            if (isOrderFilled(order.status)) {
              setOrderStatus('succeed');
              setSurplus(
                BigNumber.from(order.executedBuyAmount)
                  .sub(BigNumber.from(parseUnits(outAmount, destDecimals)))
                  .toBigInt()
              );
              setSurplusPercent(
                BigNumber.from(order?.executedBuyAmount ?? 0)
                  .sub(BigNumber.from(parseUnits(outAmount, destDecimals)))
                  .mul(BigNumber.from(10000)) // For precision
                  .div(BigNumber.from(parseUnits(outAmount, destDecimals)))
                  .toNumber() / 10000
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
  }, [txHashOrOrderId]);

  const View = useMemo(() => {
    if (provider === 'cowprotocol' && orderStatus === 'open') {
      return BaseWaitingView;
    } else if (provider === 'cowprotocol' && orderStatus === 'failed') {
      return BaseCancelledView;
    }
    return BaseSuccessView; // Default case
  }, [orderStatus, provider]);

  return (
    <View txHash={txHashOrOrderId} hideTx={provider === 'cowprotocol'}>
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
              {txHashOrOrderId && (
                <>
                  You can see the details{' '}
                  <Link
                    underline="always"
                    href={`https://explorer.cow.fi/${
                      chainId == 1 ? '' : ChainIdToNetwork[chainId] + '/'
                    }orders/${txHashOrOrderId}`}
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
              {!txHashOrOrderId && <Trans>Details will be available soon.</Trans>}
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
          {orderStatus === 'open' && (
            <>
              <FormattedNumber value={Number(outAmount)} variant="main14" />
              <Typography variant="secondary14">{outSymbol}</Typography>
            </>
          )}
          {orderStatus === 'succeed' && order && (
            // <FormattedNumber value={Number(normalize(order.executedBuyAmount, destDecimals))} color={
            //   surplusPercent && surplusPercent > 0 ? "green" : 'inherit'
            //   }  variant="main14" />
            <SwitchWithSurplusTooltip
              text={
                <Box display="flex" alignItems="center" gap={1}>
                  <FormattedNumber
                    value={Number(normalize(order?.executedBuyAmount ?? 0, destDecimals))}
                    color={surplusPercent && surplusPercent > 0 ? 'green' : 'inherit'}
                    variant="main14"
                  />
                  <Typography variant="secondary14">{outSymbol}</Typography>
                </Box>
              }
              surplus={Number(normalize(surplus?.toString() ?? 0, destDecimals))}
              surplusPercent={surplusPercent ?? 0}
              baseAmount={Number(outAmount)}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {orderStatus === 'succeed' && order && !!surplusPercent && !!surplus && (
            <>
              <Typography variant="secondary14">+</Typography>
              <FormattedNumber
                value={normalize(surplus.toString(), destDecimals)}
                visibleDecimals={2}
                variant="main14"
              />
              <FormattedNumber
                value={surplusPercent}
                percent={true}
                visibleDecimals={2}
                variant="main14"
              />
              <Typography variant="secondary14">{outSymbol}</Typography>
            </>
          )}
        </Box>
      </Box>
    </View>
  );
};
