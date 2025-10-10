import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, Divider, Typography } from '@mui/material';
import { BigNumber } from 'ethers';
import { useEffect, useMemo, useRef, useState } from 'react';
import { WalletIcon } from 'src/components/icons/WalletIcon';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Base64Token, ExternalTokenIcon, TokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip, TextWithTooltipProps } from 'src/components/TextWithTooltip';
import { useCowOrderToast } from 'src/hooks/useCowOrderToast';
import { ModalType } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';
import { networkConfigs } from 'src/ui-config/networksConfig';
import { parseUnits } from 'viem';

import { BaseCancelledView } from '../FlowCommons/BaseCancelled';
import { BaseSuccessView } from '../FlowCommons/BaseSuccess';
import { BaseWaitingView } from '../FlowCommons/BaseWaiting';
import {
  generateCoWExplorerLink,
  getOrder,
  isNativeToken,
  isOrderCancelled,
  isOrderFilled,
  isOrderLoading,
} from './cowprotocol/cowprotocol.helpers';
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
  srcDecimals: number;
  amountUsd: number;
  outAmountUSD: number;
  addToken?: ERC20TokenType;
  modalType: ModalType;
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
  srcDecimals,
  amountUsd,
  outAmountUSD,
  addToken,
  modalType,
}: SwitchTxSuccessViewProps) => {
  const { trackOrder, setHasActiveOrders } = useCowOrderToast();
  const { addERC20Token } = useWeb3Context();
  const [base64, setBase64] = useState<string>('');

  // Do polling each 10 seconds until the order get's filled
  const [orderStatus, setOrderStatus] = useState<'succeed' | 'failed' | 'open'>('open');
  const [surplus, setSurplus] = useState<bigint | undefined>(undefined);
  const [inAmount, setInAmount] = useState<string>(amount);
  const [outFinalAmount, setOutFinalAmount] = useState<string>(outAmount);

  // Market for chain id
  const networkConfig = networkConfigs[chainId].explorerLink;

  // Start tracking the order when the component mounts
  useEffect(() => {
    if (provider === 'cowprotocol' && txHashOrOrderId) {
      trackOrder(txHashOrOrderId, chainId);
    } else if (provider === 'cowprotocol' && orderStatus === 'open') {
      // If the order is open, force the spinner to show, waiting for order details e.g. eth flow
      setHasActiveOrders(true);
    }
  }, [txHashOrOrderId, chainId, provider, trackOrder, setHasActiveOrders]);

  // Poll the order status for UI updates
  const interval = useRef<NodeJS.Timeout | null>(null);
  const pollOrder = async () => {
    if (provider === 'cowprotocol' && txHashOrOrderId) {
      getOrder(txHashOrOrderId, chainId)
        .then((order) => {
          if (isOrderFilled(order.status)) {
            setOrderStatus('succeed');
            setSurplus(
              BigNumber.from(order.executedBuyAmount)
                .sub(BigNumber.from(parseUnits(outAmount, destDecimals)))
                .toBigInt()
            );
            setOutFinalAmount(normalize(order.executedBuyAmount, destDecimals));
            setInAmount(normalize(order.executedSellAmount, srcDecimals));
            if (interval.current) {
              clearInterval(interval.current);
            }
          } else if (isOrderCancelled(order.status)) {
            setOrderStatus('failed');
            if (interval.current) {
              clearInterval(interval.current);
            }
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
      destDecimals &&
      interval.current === null
    ) {
      interval.current = setInterval(pollOrder, 10000);
    }
  }, [txHashOrOrderId, chainId, provider, destDecimals]);

  const View = useMemo(() => {
    if (provider === 'cowprotocol' && orderStatus === 'open') {
      return BaseWaitingView;
    } else if (provider === 'cowprotocol' && orderStatus === 'failed') {
      return BaseCancelledView;
    }
    return BaseSuccessView; // Default case
  }, [orderStatus, provider]);

  const surplusFormatted = surplus
    ? Number(normalize(surplus.toString(), destDecimals))
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

  const shouldShowATokenCta = modalType === ModalType.CollateralSwap && addToken?.aToken;
  const watchedTokenSymbol = shouldShowATokenCta ? '' : addToken?.symbol ?? '';

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
                <Trans>You&apos;ve successfully swapped tokens.</Trans>
              )}
            </>
          ) : (
            <Trans>You&apos;ve successfully swapped tokens.</Trans>
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
          width: '80%',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography color="text.secondary">
            {provider == 'cowprotocol' &&
            ((orderStatus == 'open' && !isNativeToken(symbol)) || orderStatus == 'failed')
              ? 'Send'
              : 'Sent'}
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
              <>
                <Box>
                  <Typography fontWeight={600}>
                    <FormattedNumber
                      value={inAmount}
                      variant="main14"
                      visibleDecimals={4}
                      compact={false}
                    />
                  </Typography>
                </Box>
              </>
            </DarkTooltip>

            <Typography fontWeight={600}>{symbol}</Typography>
          </Box>
        </Box>
        {amountUsd && amountUsd > 0 && (
          <Box display="flex" justifyContent="flex-end" mb={'12px'}>
            <Typography>
              <FormattedNumber
                value={amountUsd}
                symbol="USD"
                symbolsColor="text.muted"
                variant="caption"
                color="text.muted"
                visibleDecimals={2}
                compact={false}
              />
            </Typography>
          </Box>
        )}
        <Divider sx={{ my: 1 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} mt={'12px'}>
          <Typography color="text.secondary">
            {provider == 'cowprotocol' && (orderStatus == 'open' || orderStatus == 'failed')
              ? 'Receive'
              : 'Received'}
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
              <>
                <Box>
                  <Typography fontWeight={600}>
                    <FormattedNumber
                      value={outFinalAmount}
                      variant="main14"
                      visibleDecimals={4}
                      compact={false}
                    />
                  </Typography>
                </Box>
              </>
            </DarkTooltip>

            <Typography fontWeight={600}>{outSymbol}</Typography>
          </Box>
        </Box>
        {outAmountUSD && outAmountUSD > 0 && (
          <Box display="flex" justifyContent="flex-end">
            <Typography>
              <FormattedNumber
                value={outAmountUSD}
                symbol="USD"
                symbolsColor="text.muted"
                variant="caption"
                color="text.muted"
                visibleDecimals={2}
                compact={false}
              />
            </Typography>
          </Box>
        )}
        {surplusDisplay && (
          <Typography
            variant="helperText"
            fontWeight={500}
            sx={{ float: 'right', color: 'text.secondary', mt: '4px' }}
          >
            {surplusDisplay}
          </Typography>
        )}
      </Box>
      {shouldShowATokenCta && (
        <Box
          sx={(theme) => ({
            border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
            background: theme.palette.mode === 'dark' ? 'none' : '#F7F7F9',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            mt: 4,

            width: '80%',
          })}
        >
          <TokenIcon
            symbol={addToken.symbol}
            aToken={addToken.aToken || false}
            sx={{ fontSize: '32px', mt: '12px', mb: '8px' }}
          />
          <Typography variant="description" color="text.primary" sx={{ mx: '24px' }}>
            <Trans>
              Add {addToken.aToken ? 'aToken ' : 'token '} to wallet to track your balance.
            </Trans>
          </Typography>
          <Button
            onClick={() => {
              addERC20Token({
                address: addToken.address,
                decimals: addToken.decimals,
                symbol: watchedTokenSymbol,
                image: !/_/.test(addToken.symbol) ? base64 : undefined,
              });
            }}
            variant="outlined"
            size="medium"
            sx={{ mt: '8px', mb: '12px' }}
          >
            {addToken.symbol && !/_/.test(addToken.symbol) && (
              <Base64Token
                symbol={addToken.symbol}
                onImageGenerated={setBase64}
                aToken={addToken.aToken}
              />
            )}
            <WalletIcon sx={{ width: '20px', height: '20px', mr: '4px' }} />
            <Typography variant="buttonM" ml="4px">
              <Trans>Add to wallet</Trans>
            </Typography>
          </Button>
        </Box>
      )}
    </View>
  );
};
