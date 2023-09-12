import { normalizeBN } from '@aave/math-utils';
import { Box, CircularProgress } from '@mui/material';
import React, { useState } from 'react';
import { useParaswapSellRates } from 'src/hooks/paraswap/useParaswapRates';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { AssetInput } from '../AssetInput';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { SupportedNetworkWithChainId } from './common';
import { NetworkSelector } from './NetworkSelector';
import { ParaswapRatesError } from './ParaswapRatesError';
import { SwitchActions } from './SwitchActions';
import { ReserveWithBalance } from './SwitchModal';
import { SwitchRates } from './SwitchRates';
import { SwitchSlippageSelector } from './SwitchSlippageSelector';
import { SwitchTxSuccessView } from './SwitchTxSuccessView';

interface SwitchModalContentProps {
  selectedChainId: number;
  setSelectedChainId: (value: number) => void;
  supportedNetworks: SupportedNetworkWithChainId[];
  reserves: ReserveWithBalance[];
}

export const SwitchModalContent = ({
  supportedNetworks,
  selectedChainId,
  setSelectedChainId,
  reserves,
}: SwitchModalContentProps) => {
  const [slippage, setSlippage] = useState('0.001');
  const [inputAmount, setInputAmount] = useState('0');
  const { mainTxState: switchTxState } = useModalContext();
  const user = useRootStore((store) => store.account);
  const [selectedInputReserve, setSelectedInputReserve] = useState(reserves[0]);
  const { readOnlyModeAddress } = useWeb3Context();
  const [selectedOutputReserve, setSelectedOutputReserve] = useState(reserves[1]);
  const isWrongNetwork = useIsWrongNetwork(selectedChainId);

  const handleInputChange = (value: string) => {
    if (value === '') {
      setInputAmount('0');
    } else if (value === '-1' && selectedInputReserve) {
      setInputAmount(selectedInputReserve.balance);
    } else {
      setInputAmount(value);
    }
  };

  const {
    data: sellRates,
    isLoading: ratesLoading,
    error: ratesError,
  } = useParaswapSellRates({
    chainId: selectedChainId,
    amount: normalizeBN(inputAmount, -1 * selectedInputReserve.decimals).toFixed(0),
    srcToken: selectedInputReserve.underlyingAsset,
    srcDecimals: selectedInputReserve.decimals,
    destToken: selectedOutputReserve.underlyingAsset,
    destDecimals: selectedOutputReserve.decimals,
    user,
  });

  if (sellRates && switchTxState.success) {
    return (
      <SwitchTxSuccessView
        txHash={switchTxState.txHash}
        amount={inputAmount}
        symbol={selectedInputReserve.symbol}
        outSymbol={selectedOutputReserve.symbol}
        outAmount={sellRates.destAmount}
      />
    );
  }

  return (
    <>
      <TxModalTitle title="Switch tokens" />
      {isWrongNetwork.isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          networkName={getNetworkConfig(selectedChainId).name}
          chainId={selectedChainId}
          event={{
            eventName: GENERAL.SWITCH_NETWORK,
          }}
        />
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <NetworkSelector
          networks={supportedNetworks}
          selectedNetwork={selectedChainId}
          setSelectedNetwork={setSelectedChainId}
        />
        <SwitchSlippageSelector slippage={slippage} setSlippage={setSlippage} />
      </Box>
      {!selectedInputReserve || !selectedOutputReserve ? (
        <CircularProgress />
      ) : (
        <>
          <AssetInput
            assets={reserves}
            value={inputAmount}
            onChange={handleInputChange}
            usdValue={sellRates?.srcUSD || '0'}
            symbol={selectedInputReserve?.symbol}
            onSelect={setSelectedInputReserve}
            inputTitle={' '}
          />
          <AssetInput
            assets={reserves}
            value={
              sellRates ? normalizeBN(sellRates.destAmount, sellRates.destDecimals).toString() : '0'
            }
            usdValue={sellRates?.destUSD || '0'}
            symbol={selectedOutputReserve?.symbol}
            loading={inputAmount !== '0' && ratesLoading && !ratesError}
            onSelect={setSelectedOutputReserve}
            disableInput={true}
            inputTitle={' '}
          />
          {ratesError && <ParaswapRatesError error={ratesError} />}

          {sellRates && (
            <>
              <SwitchRates
                rates={sellRates}
                srcSymbol={selectedInputReserve.symbol}
                destSymbol={selectedOutputReserve.symbol}
              />
            </>
          )}
          <SwitchActions
            isWrongNetwork={isWrongNetwork.isWrongNetwork}
            inputAmount={inputAmount}
            inputToken={selectedInputReserve.underlyingAsset}
            outputToken={selectedOutputReserve.underlyingAsset}
            slippage={slippage}
            blocked={!sellRates}
            chainId={selectedChainId}
            route={sellRates}
          />
        </>
      )}
    </>
  );
};
