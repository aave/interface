import { ArrowDownIcon, SwitchVerticalIcon } from '@heroicons/react/outline';
import { Box, IconButton, SvgIcon, Typography } from '@mui/material';
import { Dispatch } from 'react';

import { QUOTE_REFETCH_INTERVAL } from '../hooks/useSwapQuote';
import {
  isLeverageQuoteUnchosen,
  isParaswapRates,
  SwapParams,
  SwapProvider,
  SwapState,
  SwapType,
} from '../types';
import { SwitchAssetInput } from './primitives/SwapAssetInput';
import { NetworkSelector } from './shared/NetworkSelector';
import { QuoteProgressRing } from './shared/QuoteProgressRing';
import { SwitchRates } from './shared/SwitchRates';
import { SwitchSlippageSelector } from './shared/SwitchSlippageSelector';
import { SwapInputState } from './SwapInputs';

export type SwapInputsCustomProps = {
  canSwitchTokens: boolean;
};

export const MarketOrderInputs = ({
  params,
  state,
  swapState,
  setState,
  customProps,
}: {
  params: SwapParams;
  state: SwapState;
  swapState: SwapInputState;
  setState: Dispatch<Partial<SwapState>>;
  customProps?: SwapInputsCustomProps;
}) => {
  const isLeverage = params.swapType === SwapType.Leverage;
  // Amounts the backend sized for a multiplier the user never chose stay hidden.
  const hideAmounts = isLeverageQuoteUnchosen(state);
  const leverageLoading =
    isLeverage &&
    state.leverageMultiplier !== undefined &&
    (state.ratesLoading || hideAmounts) &&
    !state.error;
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent:
            params.inputInputTitle || swapState.showNetworkSelector ? 'space-between' : 'flex-end',
          alignItems: 'center',
          mb: '0.5rem',
        }}
      >
        {(params.inputInputTitle || swapState.showNetworkSelector) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {params.inputInputTitle && (
              <Typography variant="h5" color="fg-2">
                {params.inputInputTitle}
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

        <SwitchSlippageSelector
          slippageValidation={state.slippageValidation}
          slippage={state.slippage}
          suggestedSlippage={state.autoSlippage}
          setSlippage={swapState.setSlippage}
          provider={state.provider}
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
          value={hideAmounts ? '' : state.inputAmount}
          onChange={swapState.handleInputChange}
          onClear={() =>
            setState({
              inputAmount: '',
              debouncedInputAmount: '',
              inputAmountUSD: '',
              outputAmount: '',
              debouncedOutputAmount: '',
              outputAmountUSD: '',
              swapRate: undefined,
              ratesLoading: false,
              error: undefined,
              warnings: [],
              quoteRefreshPaused: true,
              quoteLastUpdatedAt: undefined,
              autoSlippage: '',
            })
          }
          usdValue={hideAmounts ? '0' : state.inputAmountUSD.toString() || '0'}
          onSelect={swapState.handleSelectedInputToken}
          selectedAsset={state.sourceToken}
          forcedMaxValue={state.forcedMaxValue}
          allowCustomTokens={params.allowCustomTokens}
          swapType={params.swapType}
          side="input"
          // A leverage is sized by its multiplier, both amounts come from the quote.
          disableInput={isLeverage}
          loading={leverageLoading}
        />

        {params.showSwitchInputAndOutputAssetsButton ? (
          <Box sx={{ position: 'absolute' }}>
            <IconButton
              onClick={swapState.onSwitchReserves}
              disabled={!(customProps?.canSwitchTokens ?? false)}
              sx={{
                border: '1px solid',
                borderColor: 'border-opaque',
                backgroundColor: 'bg-2',
                color: 'fg-3',
                '&:hover': { backgroundColor: 'bg-3' },
                '&.Mui-disabled': {
                  backgroundColor: 'bg-2',
                  color: 'fg-4',
                },
              }}
            >
              <SvgIcon sx={{ fontSize: '18px' }}>
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
              />
            )}
          </Box>
        ) : (
          !params.outputInputTitle && (
            <Box sx={{ position: 'absolute' }}>
              <IconButton
                disabled
                sx={{
                  border: '1px solid',
                  borderColor: 'border-opaque',
                  '&.Mui-disabled': {
                    backgroundColor: 'bg-2',
                  },
                }}
              >
                <SvgIcon sx={{ color: 'fg-3', fontSize: '18px' }}>
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
                />
              )}
            </Box>
          )
        )}

        <SwitchAssetInput
          chainId={state.chainId}
          balanceTitle={params.outputBalanceTitle}
          assets={swapState.outputAssets}
          title={params.outputInputTitle}
          value={hideAmounts ? '' : state.outputAmount}
          usdValue={hideAmounts ? '0' : state.outputAmountUSD || '0'}
          loading={
            isLeverage
              ? leverageLoading
              : state.debouncedInputAmount !== '0' &&
                state.debouncedInputAmount !== '' &&
                state.ratesLoading &&
                !state.error
          }
          onSelect={swapState.handleSelectedOutputToken}
          disableInput={true}
          selectedAsset={state.destinationToken}
          showBalance={params.showOutputBalance}
          allowCustomTokens={params.allowCustomTokens}
          swapType={params.swapType}
          side="output"
        />
      </Box>

      {state.swapRate && state.isSwapFlowSelected && !hideAmounts && (
        <>
          <SwitchRates
            rates={state.swapRate}
            srcSymbol={state.sourceToken.symbol}
            destSymbol={state.destinationToken.symbol}
            showPriceImpact={isParaswapRates(state.swapRate)}
          />
        </>
      )}
    </>
  );
};
