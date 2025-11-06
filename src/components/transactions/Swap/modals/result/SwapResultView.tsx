import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Divider, Typography } from '@mui/material';
import { BigNumber } from 'ethers';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ExternalTokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip, TextWithTooltipProps } from 'src/components/TextWithTooltip';
import { useSwapOrdersTracking } from 'src/hooks/useSwapOrdersTracking';
import { networkConfigs } from 'src/ui-config/networksConfig';
import { parseUnits } from 'viem';

import { BaseCancelledView } from '../../../FlowCommons/BaseCancelled';
import { BaseSuccessView } from '../../../FlowCommons/BaseSuccess';
import { BaseWaitingView } from '../../../FlowCommons/BaseWaiting';
import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import {
  generateCoWExplorerLink,
  getOrder,
  isNativeToken,
  isOrderCancelled,
  isOrderExpired,
  isOrderFilled,
  isOrderLoading,
} from '../../helpers/cow';
import { SwapParams, SwapProvider, SwapState } from '../../types';

export type SwapTxSuccessViewProps = {
  isInvertedSwap: boolean;
  txHash?: string;
  amount: string;
  symbol: string;
  iconSymbol: string;
  outAmount: string;
  outSymbol: string;
  outIconSymbol: string;
  iconUri?: string;
  outIconUri?: string;
  provider?: SwapProvider;
  chainId: number;
  buyDecimals: number;
  sellDecimals: number;
  resultScreenTokensFromTitle?: string;
  resultScreenTokensToTitle?: string;
  resultScreenTitleItems?: string;
  invalidateAppState: () => void;
};

export const SwapWithSurplusTooltip = ({
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

export const SwapResultView = ({
  params,
  state,
  trackingHandlers,
}: {
  params: SwapParams;
  state: SwapState;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  if (!state.sellAmountFormatted || !state.buyAmountFormatted) return null;

  return (
    <SwapTxSuccessView
      invalidateAppState={params.invalidateAppState}
      txHash={state.mainTxState.txHash}
      isInvertedSwap={state.isInvertedSwap}
      amount={state.sellAmountFormatted}
      symbol={state.sourceToken.symbol}
      iconSymbol={state.sourceToken.symbol} // TODO: can simplify?
      outAmount={state.buyAmountFormatted ?? ''}
      outSymbol={state.destinationToken.symbol}
      outIconSymbol={state.destinationToken.symbol}
      iconUri={state.sourceToken.logoURI}
      outIconUri={state.destinationToken.logoURI}
      provider={state.provider}
      chainId={state.chainId}
      buyDecimals={state.buyAmountToken?.decimals ?? 18}
      sellDecimals={state.sellAmountToken?.decimals ?? 18}
      resultScreenTokensFromTitle={params.resultScreenTokensFromTitle}
      resultScreenTokensToTitle={params.resultScreenTokensToTitle}
      resultScreenTitleItems={params.resultScreenTitleItems}
      trackingHandlers={trackingHandlers}
    />
  );
};

export const SwapTxSuccessView = ({
  isInvertedSwap,
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
  buyDecimals,
  sellDecimals,
  resultScreenTokensFromTitle,
  resultScreenTokensToTitle,
  resultScreenTitleItems,
  invalidateAppState,
  trackingHandlers,
}: SwapTxSuccessViewProps & { trackingHandlers?: TrackAnalyticsHandlers }) => {
  const { trackSwapOrderProgress, setHasActiveOrders } = useSwapOrdersTracking();

  // Do polling each 10 seconds until the order get's filled
  const [orderStatus, setOrderStatus] = useState<'succeed' | 'failed' | 'open'>('open');
  const [surplus, setSurplus] = useState<bigint | undefined>(undefined);
  const [inAmount, setInAmount] = useState<string>(!isInvertedSwap ? amount : outAmount);
  const [outFinalAmount, setOutFinalAmount] = useState<string>(
    !isInvertedSwap ? outAmount : amount
  );

  // Market for chain id
  const networkConfig = networkConfigs[chainId].explorerLink;

  // Start tracking the order when the component mounts
  useEffect(() => {
    if (provider === 'cowprotocol' && txHashOrOrderId) {
      trackSwapOrderProgress(txHashOrOrderId, chainId);
    } else if (provider === 'cowprotocol' && orderStatus === 'open') {
      // If the order is open, force the spinner to show, waiting for order details e.g. eth flow
      setHasActiveOrders(true);
    }
  }, [txHashOrOrderId, chainId, provider]);

  // Poll the order status for UI updates
  const interval = useRef<NodeJS.Timeout | null>(null);
  const pollOrder = async () => {
    if (provider === 'cowprotocol' && txHashOrOrderId) {
      getOrder(txHashOrOrderId, chainId)
        .then((order) => {
          if (isOrderFilled(order.status)) {
            setOrderStatus('succeed');
            setSurplus(
              BigNumber.from(isInvertedSwap ? order.executedSellAmount : order.executedBuyAmount)
                .sub(
                  BigNumber.from(
                    !isInvertedSwap
                      ? parseUnits(outAmount, buyDecimals)
                      : parseUnits(inAmount, sellDecimals)
                  )
                )
                .toBigInt()
            );
            setOutFinalAmount(
              !isInvertedSwap
                ? normalize(order.executedBuyAmount, buyDecimals)
                : normalize(order.executedSellAmount, sellDecimals)
            );
            setInAmount(
              !isInvertedSwap
                ? normalize(order.executedSellAmount, sellDecimals)
                : normalize(order.executedBuyAmount, buyDecimals)
            );
            if (interval.current) {
              clearInterval(interval.current);
            }
            invalidateAppState();
            // Analytics: CoW order filled
            trackingHandlers?.trackSwapFilled(order.executedSellAmount, order.executedBuyAmount);
          } else if (isOrderCancelled(order.status) || isOrderExpired(order.status)) {
            setOrderStatus('failed');
            if (interval.current) {
              clearInterval(interval.current);
            }
            invalidateAppState();
            // Analytics: CoW order failed
            trackingHandlers?.trackSwapFailed();
          } else if (isOrderLoading(order.status)) {
            setOrderStatus('open');
          }
        })
        .catch(console.error);
    } else if (provider === 'paraswap' && txHashOrOrderId) {
      console.error('Paraswap! Implement tracking of hash.');
    }
  };
  useEffect(() => {
    if (
      txHashOrOrderId &&
      provider === 'cowprotocol' &&
      chainId &&
      buyDecimals &&
      interval.current === null
    ) {
      interval.current = setInterval(pollOrder, 10000);
    }
  }, [txHashOrOrderId, chainId, provider, buyDecimals]);

  const View = useMemo(() => {
    if (provider === 'cowprotocol' && orderStatus === 'open') {
      return BaseWaitingView;
    } else if (provider === 'cowprotocol' && orderStatus === 'failed') {
      return BaseCancelledView;
    }
    return BaseSuccessView; // Default case
  }, [orderStatus, provider]);

  const surplusFormatted = surplus
    ? Number(normalize(surplus.toString(), isInvertedSwap ? sellDecimals : buyDecimals))
    : undefined;
  const surplusDisplay =
    surplusFormatted && surplusFormatted > 0
      ? surplusFormatted <= 0.0001
        ? `Includes small ${outSymbol} Surplus`
        : `Includes +${surplusFormatted.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: surplusFormatted < 0.01 ? 4 : 2,
          })} ${outSymbol} Surplus`
      : undefined;

  const customExplorerLink = useMemo(() => {
    return provider === 'cowprotocol'
      ? generateCoWExplorerLink(chainId, txHashOrOrderId)
      : `${networkConfig}/tx/${txHashOrOrderId}`;
  }, [provider, chainId, txHashOrOrderId]);

  const customExplorerLinkText = useMemo(() => {
    return provider === 'cowprotocol' ? (
      txHashOrOrderId ? (
        <>View details</>
      ) : (
        <>
          <CircularProgress
            size={20}
            sx={{
              mr: 1,
              color: (theme) => theme.palette.grey[400],
            }}
          />
          Details will be available soon
        </>
      )
    ) : undefined;
  }, [provider, txHashOrOrderId]);

  return (
    <View
      txHash={txHashOrOrderId}
      customExplorerLink={customExplorerLink}
      customExplorerLinkText={customExplorerLinkText}
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
                <Trans>
                  You&apos;ve successfully swapped{' '}
                  {resultScreenTitleItems ? resultScreenTitleItems : 'tokens'}.
                </Trans>
              )}
            </>
          ) : (
            <Trans>
              You&apos;ve successfully swapped{' '}
              {resultScreenTitleItems ? resultScreenTitleItems : 'tokens'}.
            </Trans>
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
          <Typography color="text.secondary">
            {provider == 'cowprotocol' &&
            ((orderStatus == 'open' && !isNativeToken(symbol)) || orderStatus == 'failed')
              ? `${resultScreenTokensFromTitle ?? 'Send'}`
              : `${resultScreenTokensFromTitle ?? 'Sent'}`}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <ExternalTokenIcon
              symbol={iconSymbol}
              logoURI={iconUri}
              height="20px"
              width="20px"
              sx={{ fontSize: 20 }}
            />
            <DarkTooltip
              title={
                <Typography variant="secondary14" color="common.white">
                  {inAmount} {symbol}
                </Typography>
              }
              arrow
              placement="top"
              enterTouchDelay={100}
              leaveTouchDelay={500}
            >
              <Box>
                <Typography fontWeight={600}>
                  {Number(inAmount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: Number(inAmount) < 0.01 ? 4 : 2,
                  })}{' '}
                </Typography>
              </Box>
            </DarkTooltip>
            <Typography fontWeight={600} sx={{ color: 'text.secondary' }}>
              {symbol}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography color="text.secondary">
            {provider == 'cowprotocol' && (orderStatus == 'open' || orderStatus == 'failed')
              ? `${resultScreenTokensToTitle ?? 'Receive'}`
              : `${resultScreenTokensToTitle ?? 'Received'}`}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <ExternalTokenIcon
              symbol={outIconSymbol}
              logoURI={outIconUri}
              height="20px"
              width="20px"
              sx={{ fontSize: 20 }}
            />
            <DarkTooltip
              title={
                <Typography variant="secondary14" color="common.white">
                  {outFinalAmount} {outSymbol}
                </Typography>
              }
              arrow
              placement="top"
              enterTouchDelay={100}
              leaveTouchDelay={500}
            >
              <Box>
                <Typography fontWeight={600}>
                  {Number(outFinalAmount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: Number(outFinalAmount) < 0.01 ? 4 : 2,
                  })}
                </Typography>
              </Box>
            </DarkTooltip>
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
    </View>
  );
};
