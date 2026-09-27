import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { CircularProgress, Typography } from '@mui/material';
import { BigNumber } from 'ethers';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { ExternalTokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip, TextWithTooltipProps } from 'src/components/TextWithTooltip';
import { useModalContext } from 'src/hooks/useModal';
import { useSwapOrdersTracking } from 'src/hooks/useSwapOrdersTracking';
import { findByChainId } from 'src/ui-config/marketsConfig';
import { networkConfigs } from 'src/ui-config/networksConfig';
import { parseUnits } from 'viem';

import { TxResultDetails, TxResultRow } from '../../../FlowCommons/TxResultDetails';
import { TxResultStatus, TxResultView } from '../../../FlowCommons/TxResultView';
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

type OrderResultStatus = 'succeed' | 'failed' | 'expired' | 'open';

const ORDER_RESULT_STATUS: Record<OrderResultStatus, TxResultStatus> = {
  open: 'pending',
  succeed: 'success',
  failed: 'cancelled',
  expired: 'expired',
};

const TokenAmount = ({
  amount,
  symbol,
  iconSymbol,
  iconUri,
}: {
  amount: string;
  symbol: string;
  iconSymbol: string;
  iconUri?: string;
}) => (
  <>
    <ExternalTokenIcon
      symbol={iconSymbol}
      logoURI={iconUri}
      height="18px"
      width="18px"
      sx={{ fontSize: 18 }}
    />
    <DarkTooltip
      title={
        <Typography variant="h5">
          {amount} {symbol}
        </Typography>
      }
      arrow
      placement="top"
      enterTouchDelay={100}
      leaveTouchDelay={500}
    >
      <span>
        <FormattedNumber
          value={amount}
          visibleDecimals={2}
          variant="h5"
          color="fg-1"
          component="span"
        />{' '}
        {symbol}
      </span>
    </DarkTooltip>
  </>
);

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
  resultScreenTokensFromTitle?: ReactNode;
  resultScreenTokensToTitle?: ReactNode;
  resultScreenTitleItems?: ReactNode;
  invalidateAppState: () => void;
  /**
   * Showcase/dev only: pins the CoW order result and skips order tracking and polling.
   * Never set in production.
   */
  previewOrder?: { status: OrderResultStatus; surplus?: bigint };
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
          Base: <FormattedNumber value={baseAmount} compact variant="subheader1" />
        </Typography>
        <Typography>
          Surplus:{' '}
          <FormattedNumber value={surplus} visibleDecimals={2} compact variant="subheader1" /> (
          <FormattedNumber
            value={surplusPercent}
            percent={true}
            visibleDecimals={2}
            compact
            variant="subheader1"
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
  previewOrder,
  trackingHandlers,
}: SwapTxSuccessViewProps & { trackingHandlers?: TrackAnalyticsHandlers }) => {
  const { trackSwapOrderProgress, setHasActiveOrders } = useSwapOrdersTracking();
  const { close } = useModalContext();

  // Do polling each 10 seconds until the order get's filled
  const [orderStatus, setOrderStatus] = useState<OrderResultStatus>(previewOrder?.status ?? 'open');
  const [surplus, setSurplus] = useState<bigint | undefined>(previewOrder?.surplus);
  const [inAmount, setInAmount] = useState<string>(!isInvertedSwap ? amount : outAmount);
  const [outFinalAmount, setOutFinalAmount] = useState<string>(
    !isInvertedSwap ? outAmount : amount
  );

  // Market for chain id
  const networkConfig = networkConfigs[chainId].explorerLink;

  // Start tracking the order when the component mounts
  useEffect(() => {
    if (previewOrder) return;
    if (provider === 'cowprotocol' && txHashOrOrderId) {
      trackSwapOrderProgress(txHashOrOrderId, chainId);
    } else if (provider === 'cowprotocol' && orderStatus === 'open') {
      // If the order is open, force the spinner to show, waiting for order details e.g. eth flow
      setHasActiveOrders(true);
    }
  }, [txHashOrOrderId, chainId, provider, previewOrder]);

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
            setOrderStatus(isOrderExpired(order.status) ? 'expired' : 'failed');
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
      !previewOrder &&
      txHashOrOrderId &&
      provider === 'cowprotocol' &&
      chainId &&
      buyDecimals &&
      interval.current === null
    ) {
      interval.current = setInterval(pollOrder, 10000);
    }
  }, [txHashOrOrderId, chainId, provider, buyDecimals, previewOrder]);

  const status = provider === 'cowprotocol' ? ORDER_RESULT_STATUS[orderStatus] : 'success';
  const sending =
    status === 'cancelled' ||
    status === 'expired' ||
    (status === 'pending' && !isNativeToken(symbol));

  const surplusFormatted = surplus
    ? Number(normalize(surplus.toString(), isInvertedSwap ? sellDecimals : buyDecimals))
    : undefined;

  const titleItems = resultScreenTitleItems || <Trans>tokens</Trans>;

  const customExplorerLink = useMemo(() => {
    return provider === 'cowprotocol'
      ? generateCoWExplorerLink(chainId, txHashOrOrderId)
      : `${networkConfig}/tx/${txHashOrOrderId}`;
  }, [provider, chainId, txHashOrOrderId]);

  const customExplorerLinkText = useMemo(() => {
    return provider === 'cowprotocol' ? (
      txHashOrOrderId ? (
        <Trans>View details</Trans>
      ) : (
        <>
          <CircularProgress
            size={20}
            sx={{
              mr: 1,
              color: (theme) => theme.vars.palette.grey[400],
            }}
          />
          <Trans>Details will be available soon</Trans>
        </>
      )
    ) : undefined;
  }, [provider, txHashOrOrderId]);

  return (
    <TxResultView
      status={status}
      txHash={txHashOrOrderId}
      customExplorerLink={customExplorerLink}
      customExplorerLinkText={customExplorerLinkText}
      description={
        status === 'pending' ? (
          <Trans>You&apos;ve successfully submitted an order.</Trans>
        ) : status === 'success' ? (
          <Trans>You&apos;ve successfully swapped {titleItems}.</Trans>
        ) : (
          <Trans>The order couldn&apos;t be filled.</Trans>
        )
      }
    >
      <TxResultDetails>
        <TxResultRow
          label={
            resultScreenTokensFromTitle ?? (sending ? <Trans>Send</Trans> : <Trans>Sent</Trans>)
          }
        >
          <TokenAmount
            amount={inAmount}
            symbol={symbol}
            iconSymbol={iconSymbol}
            iconUri={iconUri}
          />
        </TxResultRow>
        <TxResultRow
          label={
            resultScreenTokensToTitle ??
            (status === 'success' ? <Trans>Received</Trans> : <Trans>Receive</Trans>)
          }
        >
          <TokenAmount
            amount={outFinalAmount}
            symbol={outSymbol}
            iconSymbol={outIconSymbol}
            iconUri={outIconUri}
          />
        </TxResultRow>
        {surplusFormatted !== undefined && surplusFormatted > 0 && (
          <TxResultRow label={<Trans>Surplus</Trans>}>
            <span>
              <FormattedNumber
                value={surplusFormatted}
                visibleDecimals={2}
                variant="h5"
                color="fg-1"
                component="span"
              />{' '}
              {outSymbol}
            </span>
          </TxResultRow>
        )}
      </TxResultDetails>

      <Typography variant="base" color="fg-3" sx={{ mt: '1.5rem', textAlign: 'center' }}>
        <Trans>
          Swap saved in your{' '}
          <Link
            onClick={close}
            sx={{
              color: 'fg-1',
              '&:hover': {
                color: 'fg-2',
                transition: 'color 0.2s ease',
                cursor: 'pointer',
              },
            }}
            href={`/history?marketName=${findByChainId(chainId)?.market}`}
          >
            history
          </Link>{' '}
          section.
        </Trans>
      </Typography>
    </TxResultView>
  );
};
