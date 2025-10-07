import { SwitchVerticalIcon } from '@heroicons/react/outline';
import { Box, IconButton, SvgIcon } from '@mui/material';
import { Dispatch } from 'react';

import { SwappableToken, SwapParams, SwapState } from '../types';
import { SwitchAssetInput } from './primitives/SwapAssetInput';
import { ExpirySelector } from './shared/ExpirySelector';
import { NetworkSelector } from './shared/NetworkSelector';
import { PriceInput } from './shared/PriceInput';
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
          setSelectedExpiry={(expiry: number) => setState({ expiry })}
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
          assets={swapState.inputAssets}
          value={state.inputAmount}
          onChange={swapState.handleInputChange}
          usdValue={state.inputAmountUSD || '0'}
          onSelect={swapState.handleSelectedInputToken}
          selectedAsset={state.sourceToken}
          forcedMaxValue={state.forcedMaxValue}
          allowCustomTokens={params.allowCustomTokens}
        />

        {params.showSwitchInputAndOutputAssetsButton && (
          <IconButton
            onClick={swapState.onSwitchReserves}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              position: 'absolute',
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
        )}
        <SwitchAssetInput
          chainId={state.chainId}
          balanceTitle={params.outputBalanceTitle}
          // TODO: Clean
          assets={swapState.outputAssets}
          value={state.outputAmount}
          usdValue={state.outputAmountUSD || '0'}
          loading={
            state.debouncedInputAmount !== '0' &&
            state.debouncedInputAmount !== '' &&
            state.ratesLoading &&
            !state.errors.length
          }
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
          rate={state.swapRate}
          onNewRateSet={(_newRate: number, _targetAsset: SwappableToken) => {
            console.log('TODO: implement this {_newRate, _targetAsset}');
            console.log(_newRate, _targetAsset);
          }} // TODO need to change where i get the quote from in actions
        />
      </Box>
    </>
  );
};
