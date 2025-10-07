import { ArrowDownIcon, SwitchVerticalIcon } from '@heroicons/react/outline';
import { Box, IconButton, SvgIcon } from '@mui/material';
import { Dispatch } from 'react';

import { QUOTE_REFETCH_INTERVAL } from '../hooks/useSwapQuote';
import { SwapParams, SwapState } from '../types';
import { SwitchAssetInput } from './primitives/SwapAssetInput';
import { ExpirySelector } from './shared/ExpirySelector';
import { NetworkSelector } from './shared/NetworkSelector';
import { PriceInput } from './shared/PriceInput';
import { QuoteProgressRing } from './shared/QuoteProgressRing';
import { SwapInputState } from './SwapInputs';

export const LimitOrderInputs = ({
  params,
  state,
  swapState,
  setState,
}: {
  params: SwapParams;
  state: SwapState;
  swapState: SwapInputState;
  setState: Dispatch<Partial<SwapState>>;
}) => {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: !swapState.showNetworkSelector ? 'flex-end' : 'space-between',
          alignItems: 'center',
        }}
      >
        {swapState.showNetworkSelector && (
          <NetworkSelector
            networks={params.supportedNetworks}
            selectedNetwork={state.chainId}
            setSelectedNetwork={swapState.handleSelectedNetworkChange}
          />
        )}

        <ExpirySelector
          selectedExpiry={state.expiry}
          setSelectedExpiry={(expiry: number) => {
            const remaining = expiry;
            const fromNow = Math.floor(Date.now() / 1000) + remaining;
            setState({ expiry: fromNow });
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
          onChange={swapState.handleInputChange}
          usdValue={state.inputAmountUSD || '0'}
          onSelect={swapState.handleSelectedInputToken}
          selectedAsset={state.sourceToken}
          forcedMaxValue={state.forcedMaxValue}
          allowCustomTokens={params.allowCustomTokens}
        />

        {params.showSwitchInputAndOutputAssetsButton && !params.outputInputTitle ? (
          <Box sx={{ position: 'absolute' }}>
            <IconButton
              onClick={swapState.onSwitchReserves}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                transform: 'translateY(-130%)',
                backgroundColor: 'background.paper',
                '&:hover': { backgroundColor: 'background.surface' },
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
                active={state.provider === 'cowprotocol'}
                lastUpdatedAt={state.quoteLastUpdatedAt ?? null}
                intervalMs={QUOTE_REFETCH_INTERVAL}
                size={38}
                paused={state.actionsLoading}
                sx={{
                  transform: 'translateY(-124%)',
                }}
              />
            )}
          </Box>
        ) : (
          !params.outputInputTitle && (
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
                  active={state.provider === 'cowprotocol'}
                  lastUpdatedAt={state.quoteLastUpdatedAt ?? null}
                  intervalMs={QUOTE_REFETCH_INTERVAL}
                  size={38}
                  paused={state.actionsLoading}
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
          assets={swapState.outputAssets}
          value={state.outputAmount}
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
          onSelect={swapState.handleSelectedOutputToken}
          disableInput={false}
          selectedAsset={state.destinationToken}
          showBalance={false}
          allowCustomTokens={params.allowCustomTokens}
        />

        <PriceInput
          originAsset={state.sourceToken}
          targetAsset={state.destinationToken}
          loading={state.ratesLoading}
          inputAmount={state.inputAmount}
          outputAmount={state.outputAmount}
          inputAmountUSD={state.inputAmountUSD}
          outputAmountUSD={state.outputAmountUSD}
          handleRateChange={swapState.handleRateChange}
          disabled={!state.swapRate?.srcSpotAmount || !state.swapRate?.destSpotAmount} // No initial rate set yet
        />
      </Box>
    </>
  );
};
