import { ReserveDataHumanized } from '@aave/contract-helpers';
import { normalizeBN } from '@aave/math-utils';
import { Box, CircularProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { CustomMarket, getNetworkConfig, marketsData } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { AssetInput } from '../AssetInput';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { supportedNetworksWithEnabledMarket } from './common';
import { NetworkSelector } from './NetworkSelector';
import { ParaswapRatesError } from './ParaswapRatesError';
import { SwitchActions } from './SwitchActions';
import { SwitchRates } from './SwitchRates';
import { SwitchSlippageSelector } from './SwitchSlippageSelector';
import { useSwitchLogic } from './useSwitchLogic';

const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];

export const SwitchModalContent = () => {
  const [slippage, setSlippage] = useState('0.001');
  const [inputAmount, setInputAmount] = useState('0');
  const user = useRootStore((store) => store.account);
  const [selectedInputReserve, setSelectedInputReserve] = useState<
    ReserveDataHumanized & { balance: string }
  >();
  const { readOnlyModeAddress } = useWeb3Context();
  const [selectedOutputReserve, setSelectedOutputReserve] = useState<ReserveDataHumanized>();
  const currentChainId = useRootStore((state) => state.currentChainId);
  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === currentChainId))
      return currentChainId;
    return defaultNetwork.chainId;
  });
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

  const { reservesWithBalance, sellRates, reservesLoading, ratesLoading, ratesError } =
    useSwitchLogic({
      selectedChainId,
      user,
      inputAmount,
      inputReserve: selectedInputReserve,
      outputReserve: selectedOutputReserve,
    });

  useEffect(() => {
    if (reservesWithBalance.length > 1) {
      setSelectedInputReserve(reservesWithBalance[0]);
      setSelectedOutputReserve(reservesWithBalance[1]);
    }
  }, [reservesWithBalance]);

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
          networks={supportedNetworksWithEnabledMarket}
          selectedNetwork={selectedChainId}
          setSelectedNetwork={setSelectedChainId}
        />
        <SwitchSlippageSelector slippage={slippage} setSlippage={setSlippage} />
      </Box>
      {reservesLoading || !selectedInputReserve || !selectedOutputReserve ? (
        <CircularProgress />
      ) : (
        <>
          <AssetInput
            assets={reservesWithBalance}
            value={inputAmount}
            onChange={handleInputChange}
            usdValue={sellRates?.srcUSD || '0'}
            symbol={selectedInputReserve?.symbol}
            onSelect={setSelectedInputReserve}
            inputTitle={' '}
          />
          <AssetInput
            assets={reservesWithBalance}
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
              <SwitchActions
                isWrongNetwork={isWrongNetwork.isWrongNetwork}
                inputAmount={inputAmount}
                inputToken={selectedInputReserve.underlyingAsset}
                outputToken={selectedOutputReserve.underlyingAsset}
                slippage={slippage}
                swapper={sellRates.contractAddress || ''}
                blocked={false}
                chainId={selectedChainId}
                inputDecimals={sellRates.srcDecimals || 0}
                outputDecimals={sellRates.destDecimals || 0}
                route={sellRates}
              />
            </>
          )}
        </>
      )}
    </>
  );
};
