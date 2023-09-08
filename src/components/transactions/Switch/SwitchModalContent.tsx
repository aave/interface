import { ReserveDataHumanized, ReservesDataHumanized } from '@aave/contract-helpers';
import { normalizeBN } from '@aave/math-utils';
import { Box, CircularProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParaswapSellRates } from 'src/hooks/paraswap/useParaswapRates';
import { usePoolsReservesHumanized } from 'src/hooks/pool/usePoolReserves';
import { useRootStore } from 'src/store/root';
import {
  CustomMarket,
  MarketDataType,
  getSupportedChainIds,
  marketsData,
  networkConfigs,
} from 'src/utils/marketsAndNetworksConfig';

import { AssetInput } from '../AssetInput';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { NetworkSelector } from './NetworkSelector';
import { SwitchRates } from './SwitchRates';
import { SwitchSlippageSelector } from './SwitchSlippageSelector';
import { SwitchActions } from './SwitchActions';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';

const flattenNetworkReserves = (reserves: ReservesDataHumanized[]): ReserveDataHumanized[] => {
  return reserves.reduce((acc, elem) => {
    return acc.concat(elem.reservesData);
  }, [] as ReserveDataHumanized[]);
};

const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];

export const SwitchModalContent = () => {
  const [slippage, setSlippage] = useState('0.001');
  const [inputAmount, setInputAmount] = useState('0');
  const user = useRootStore((store) => store.account);
  const [selectedInputReserve, setSelectedInputReserve] = useState<ReserveDataHumanized>();
  const [selectedOutputReserve, setSelectedOutputReserve] = useState<ReserveDataHumanized>();
  const currentChainId = useRootStore((state) => state.currentChainId);
  const supportedNetworksConfig = getSupportedChainIds().map((chainId) => ({
    ...networkConfigs[chainId],
    chainId,
  }));
  const supportedNetworksWithEnabledMarket =  supportedNetworksConfig.filter(elem => Object.values(marketsData).find(market => market.chainId === elem.chainId && market.enabledFeatures?.switch));
  const [selectedChainId, setSelectedChainId] = useState(() => {
    if(supportedNetworksWithEnabledMarket.find(elem => elem.chainId === currentChainId)) return currentChainId
    return defaultNetwork.chainId
  });
  const isWrongNetwork = useIsWrongNetwork(selectedChainId);
  const marketsBySupportedNetwork = Object.values(marketsData).filter(
    (elem) => elem.chainId === selectedChainId && elem.enabledFeatures?.switch
  ).reduce((acum, elem) => {
    if(acum.find(acumElem => acumElem.chainId === elem.chainId)) return acum;
    return acum.concat(elem)
  }, [] as MarketDataType[])
  const { data: networkReserves, isLoading } = usePoolsReservesHumanized(
    marketsBySupportedNetwork,
    { select: flattenNetworkReserves, refetchInterval: 0 }
  );

  const { data: paraswapSellRates, isLoading: paraswapRatesLoading, error: paraswapRatesError } = useParaswapSellRates({
    chainId: selectedChainId,
    amount: normalizeBN(inputAmount, -1 * (selectedInputReserve?.decimals || 0)).toFixed(0),
    srcToken: selectedInputReserve?.underlyingAsset,
    srcDecimals: selectedInputReserve?.decimals,
    destToken: selectedOutputReserve?.underlyingAsset,
    destDecimals: selectedOutputReserve?.decimals,
    user,
  });

  useEffect(() => {
    if (networkReserves) {
      setSelectedInputReserve(networkReserves[0]);
      setSelectedOutputReserve(networkReserves[1]);
    }
  }, [networkReserves]);

  const handleInputChange = (value: string) => {
    if (value === '') {
      setInputAmount('0');
    } else {
      setInputAmount(value);
    }
  };

  return (
    <>
      <TxModalTitle title="Switch tokens" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <NetworkSelector
          networks={supportedNetworksWithEnabledMarket}
          selectedNetwork={selectedChainId}
          setSelectedNetwork={setSelectedChainId}
        />
        <SwitchSlippageSelector slippage={slippage} setSlippage={setSlippage} />
      </Box>
      {isLoading || !networkReserves || !selectedInputReserve || !selectedOutputReserve ? (
        <CircularProgress />
      ) : (
        <>
          <AssetInput
            assets={networkReserves}
            value={inputAmount}
            onChange={handleInputChange}
            usdValue={paraswapSellRates?.srcUSD || '0'}
            symbol={selectedInputReserve?.symbol}
            onSelect={setSelectedInputReserve}
            inputTitle={' '}
          />
          <AssetInput
            assets={networkReserves}
            value={paraswapSellRates?.destAmount || '0'}
            usdValue={paraswapSellRates?.destUSD || '0'}
            symbol={selectedOutputReserve?.symbol}
            loading={paraswapRatesLoading}
            onSelect={setSelectedOutputReserve}
            disableInput={true}
            inputTitle={' '}
          />
          <SwitchRates
            token1Symbol={selectedInputReserve.symbol}
            token2Symbol={selectedOutputReserve.symbol}
            token1Price={paraswapSellRates?.srcAmount || '0'}
            token2Price={paraswapSellRates?.destAmount || '0'}
            token1UsdPrice={paraswapSellRates?.srcUSD || '0'}
            token2UsdPrice={paraswapSellRates?.destUSD || '0'}
          />
          <SwitchActions
            isWrongNetwork={isWrongNetwork.isWrongNetwork}
            inputAmount={inputAmount}
            inputToken={selectedInputReserve.underlyingAsset}
            outputToken={selectedOutputReserve.underlyingAsset}
            slippage={slippage}
            swapper={paraswapSellRates?.contractAddress || ''}
            blocked={false}
            chainId={selectedChainId}
            inputDecimals={paraswapSellRates?.srcDecimals || 0}
            outputDecimals={paraswapSellRates?.destDecimals || 0}
            route={paraswapSellRates}
          />
        </>
      )}
    </>
  );
};
