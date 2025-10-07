import { ArrowDownIcon, SwitchVerticalIcon } from '@heroicons/react/outline';
import { Box, IconButton, SvgIcon } from '@mui/material';
import { Dispatch } from 'react';

import { isCowProtocolRates, SwapParams, SwapState } from '../types';
import { SwitchAssetInput } from './primitives/SwapAssetInput';
import { NetworkSelector } from './shared/NetworkSelector';
import { SwitchRates } from './shared/SwitchRates';
import { SwitchSlippageSelector } from './shared/SwitchSlippageSelector';
import { SwapInputState } from './SwapInputs';

export const MarketOrderInputs = ({
  params,
  state,
  swapState,
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

        <SwitchSlippageSelector
          slippageValidation={state.slippageValidation}
          slippage={state.slippage}
          setSlippage={swapState.setSlippage}
          suggestedSlippage={state.autoSlippage}
          provider={state.swapRate?.provider}
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
          // TODO: Clean this
          title={params.inputInputTitle}
          assets={swapState.inputAssets}
          value={state.inputAmount}
          onChange={swapState.handleInputChange}
          usdValue={state.inputAmountUSD.toString() || '0'}
          onSelect={swapState.handleSelectedInputToken}
          selectedAsset={state.sourceToken}
          forcedMaxValue={state.forcedMaxValue}
          allowCustomTokens={params.allowCustomTokens}
        />

        {params.showSwitchInputAndOutputAssetsButton && !params.outputInputTitle ? (
          <IconButton
            onClick={swapState.onSwitchReserves}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              position: 'absolute',
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
        ) : (
          !params.outputInputTitle && (
            <IconButton
              disabled
              disableFocusRipple
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                position: 'absolute',
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
          )
        )}

        <SwitchAssetInput
          chainId={state.chainId}
          balanceTitle={params.outputBalanceTitle}
          // TODO: Clean
          assets={swapState.outputAssets}
          title={params.outputInputTitle}
          value={state.outputAmount}
          usdValue={state.outputAmountUSD || '0'}
          loading={
            state.debouncedInputAmount !== '0' &&
            state.debouncedInputAmount !== '' &&
            state.ratesLoading &&
            !state.errors.length
          }
          onSelect={swapState.handleSelectedOutputToken}
          disableInput={true}
          selectedAsset={state.destinationToken}
          showBalance={params.showOutputBalance}
          allowCustomTokens={params.allowCustomTokens}
        />
      </Box>

      {state.swapRate && state.isSwapFlowSelected && (
        <>
          <SwitchRates
            rates={state.swapRate}
            srcSymbol={state.sourceToken.symbol}
            destSymbol={state.destinationToken.symbol}
            // TODO: can we abstract provider here
            showPriceImpact={!isCowProtocolRates(state.swapRate)}
          />
        </>
      )}
    </>
  );
};
