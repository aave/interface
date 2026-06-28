import { ArrowDownIcon, SwitchVerticalIcon } from '@heroicons/react/outline';
import { Box, IconButton, SvgIcon, Typography } from '@mui/material';
import { Dispatch } from 'react';

import { SwapInputChanges } from '../analytics/constants';
import { TrackAnalyticsHandlers } from '../analytics/useTrackAnalytics';
import { QUOTE_REFETCH_INTERVAL } from '../hooks/useSwapQuote';
import { Expiry, OrderType, SwapParams, SwapProvider, SwapState } from '../types';
import { SwitchAssetInput } from './primitives/SwapAssetInput';
import { ExpirySelector } from './shared/ExpirySelector';
import { NetworkSelector } from './shared/NetworkSelector';
import { PriceInput } from './shared/PriceInput';
import { QuoteProgressRing } from './shared/QuoteProgressRing';
import { SwapInputState } from './SwapInputs';

export type SwapInputsCustomProps = {
  canSwitchTokens: boolean;
};

export const LimitOrderInputs = ({
  params,
  state,
  swapState,
  setState,
  customProps,
  trackingHandlers,
}: {
  params: SwapParams;
  state: SwapState;
  swapState: SwapInputState;
  setState: Dispatch<Partial<SwapState>>;
  customProps?: SwapInputsCustomProps;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  // Prioritize Limit Order specific input/output titles
  let inputInputTitle;
  let outputInputTitle;

  if (state.orderType === OrderType.LIMIT) {
    if (!inputInputTitle) {
      inputInputTitle =
        state.processedSide === 'sell' ? params.inputInputTitleSell : params.inputInputTitleBuy;
    }
    if (!outputInputTitle) {
      outputInputTitle =
        state.processedSide === 'buy' ? params.outputInputTitleBuy : params.outputInputTitleSell;
    }
  }
  // Fallback to global input/output titles
  if (!inputInputTitle) {
    inputInputTitle = params.inputInputTitle;
  }
  if (!outputInputTitle) {
    outputInputTitle = params.outputInputTitle;
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent:
            inputInputTitle || swapState.showNetworkSelector ? 'space-between' : 'flex-end',
          alignItems: 'center',
        }}
      >
        {(inputInputTitle || swapState.showNetworkSelector) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {inputInputTitle && (
              <Typography variant="secondary14" color="text.secondary">
                {inputInputTitle}
              </Typography>
            )}
            {swapState.showNetworkSelector && (
              <NetworkSelector
                networks={params.supportedNetworks}
                selectedNetwork={state.chainId}
                setSelectedNetwork={swapState.handleSelectedNetworkChange}
              />
            )}
          </Box>
        )}

        <ExpirySelector
          selectedExpiry={state.expiry}
          setSelectedExpiry={(expiry: Expiry) => {
            setState({ expiry });
            trackingHandlers.trackInputChange(SwapInputChanges.EXPIRY, expiry.toString());
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: '15px',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <SwitchAssetInput
          chainId={state.chainId}
          balanceTitle={params.inputBalanceTitle}
          assets={swapState.inputAssets}
          value={state.inputAmount}
          enableHover={true}
          loading={
            state.debouncedOutputAmount !== '0' &&
            state.debouncedOutputAmount !== '' &&
            state.ratesLoading &&
            !state.error
          }
          onChange={swapState.handleInputChange}
          onClear={() => {
            setState({
              inputAmount: '',
              debouncedInputAmount: '',
              inputAmountUSD: '',
              quoteRefreshPaused: true,
              quoteLastUpdatedAt: undefined,
            });
            if (state.outputAmount === '') {
              // Both reset to listen quotes
              setState({
                swapRate: undefined,
                quoteRefreshPaused: false,
                quoteLastUpdatedAt: undefined,
              });
            }
          }}
          usdValue={state.inputAmountUSD || '0'}
          onSelect={swapState.handleSelectedInputToken}
          selectedAsset={state.sourceToken}
          forcedMaxValue={state.forcedMaxValue}
          allowCustomTokens={params.allowCustomTokens}
          swapType={params.swapType}
          side="input"
        />

        {params.showSwitchInputAndOutputAssetsButton ? (
          <Box sx={{ position: 'absolute' }}>
            <IconButton
              onClick={swapState.onSwitchReserves}
              disabled={!(customProps?.canSwitchTokens ?? false)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                transform: 'translateY(-130%)',
                backgroundColor: 'background.paper',
                '&:hover': { backgroundColor: 'background.surface' },
                '&:disabled': {
                  backgroundColor: 'background.surface',
                  opacity: '0.7',
                  color: 'text.secondary',
                },
              }}
            >
              <SvgIcon
                sx={{
                  color: 'primary.main',
                  fontSize: '18px',
                }}
              >
                <SwitchVerticalIcon />
              </SvgIcon>
            </IconButton>
            {!state.quoteRefreshPaused && (
              <QuoteProgressRing
                active={state.provider !== SwapProvider.NONE && !!state.provider}
                lastUpdatedAt={state.quoteLastUpdatedAt ?? null}
                intervalMs={QUOTE_REFETCH_INTERVAL}
                size={38}
                paused={state.actionsLoading || !!state.mainTxState.txHash}
                sx={{
                  transform: 'translateY(-124%)',
                }}
              />
            )}
          </Box>
        ) : (
          !outputInputTitle && (
            <Box sx={{ position: 'absolute' }}>
              <IconButton
                disabled
                disableFocusRipple
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  transform: 'translateY(-130%)',
                  backgroundColor: 'background.paper',
                  '&:disabled': {
                    backgroundColor: 'background.paper',
                  },
                  '&:hover': { backgroundColor: 'background.paper' },
                }}
              >
                <SvgIcon
                  sx={{
                    color: 'primary.main',
                    fontSize: '18px',
                  }}
                >
                  <ArrowDownIcon />
                </SvgIcon>
              </IconButton>
              {!state.quoteRefreshPaused && (
                <QuoteProgressRing
                  active={state.provider !== SwapProvider.NONE && !!state.provider}
                  lastUpdatedAt={state.quoteLastUpdatedAt ?? null}
                  intervalMs={QUOTE_REFETCH_INTERVAL}
                  size={38}
                  paused={state.actionsLoading || !!state.mainTxState.txHash}
                  sx={{
                    transform: 'translateY(-124%)',
                  }}
                />
              )}
            </Box>
          )
        )}

        <SwitchAssetInput
          chainId={state.chainId}
          balanceTitle={params.outputBalanceTitle}
          title={outputInputTitle}
          assets={swapState.outputAssets}
          value={state.outputAmount}
          enableHover={true}
          usdValue={state.outputAmountUSD || '0'}
          loading={
            state.debouncedInputAmount !== '0' &&
            state.debouncedInputAmount !== '' &&
            state.ratesLoading &&
            !state.error
          }
          onChange={(value) => {
            swapState.handleOutputChange(value);
          }}
          onClear={() => {
            setState({
              outputAmount: '',
              debouncedOutputAmount: '',
              outputAmountUSD: '',
              quoteRefreshPaused: true,
              quoteLastUpdatedAt: undefined,
            });
            if (state.inputAmount === '') {
              // Both reset to listen quotes
              setState({
                swapRate: undefined,
                quoteRefreshPaused: false,
                quoteLastUpdatedAt: undefined,
              });
            }
          }}
          onSelect={swapState.handleSelectedOutputToken}
          disableInput={false}
          selectedAsset={state.destinationToken}
          showBalance={false}
          allowCustomTokens={params.allowCustomTokens}
          swapType={params.swapType}
          side="output"
        />

        <PriceInput
          originAsset={state.sourceToken}
          originAssetAmount={state.inputAmount}
          originAssetAmountUSD={state.inputAmountUSD}
          targetAsset={state.destinationToken}
          targetAssetAmount={state.outputAmount}
          targetAssetAmountUSD={state.outputAmountUSD}
          loading={state.ratesLoading}
          handleRateChange={swapState.handleRateChange}
          disabled={!state.swapRate?.srcSpotAmount || !state.swapRate?.destSpotAmount} // No initial rate set yet
        />
      </Box>
    </>
  );
};
