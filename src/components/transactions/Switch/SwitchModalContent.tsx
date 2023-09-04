import { ReserveDataHumanized, ReservesDataHumanized } from '@aave/contract-helpers';
import { normalizeBN } from '@aave/math-utils';
import { CircularProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParaswapSellRates } from 'src/hooks/paraswap/useParaswapRates';
import { usePoolsReservesHumanized } from 'src/hooks/pool/usePoolReserves';
import { useRootStore } from 'src/store/root';
import {
  getSupportedChainIds,
  marketsData,
  networkConfigs,
} from 'src/utils/marketsAndNetworksConfig';

import { AssetInput } from '../AssetInput';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { NetworkSelector } from './NetworkSelector';

const flattenNetworkReserves = (reserves: ReservesDataHumanized[]): ReserveDataHumanized[] => {
  return reserves.reduce((acc, elem) => {
    return acc.concat(elem.reservesData);
  }, [] as ReserveDataHumanized[]);
};

export const SwitchModalContent = () => {
  const [inputAmount, setInputAmount] = useState('0');
  const user = useRootStore((store) => store.account);
  const [selectedInputReserve, setSelectedInputReserve] = useState<ReserveDataHumanized>();
  const [selectedOutputReserve, setSelectedOutputReserve] = useState<ReserveDataHumanized>();
  const currentChainId = useRootStore((state) => state.currentChainId);
  const [selectedChainId, setSelectedChainId] = useState(() => currentChainId);
  const supportedNetworksConfig = getSupportedChainIds().map((chainId) => ({
    ...networkConfigs[chainId],
    chainId,
  }));
  const marketsBySupportedNetwork = Object.values(marketsData).filter(
    (elem) => elem.chainId === selectedChainId
  );
  const { data: networkReserves, isLoading } = usePoolsReservesHumanized(
    marketsBySupportedNetwork,
    { select: flattenNetworkReserves, refetchInterval: 0 }
  );

  const { data: paraswapSellRates, isLoading: paraswapRatesLoading } = useParaswapSellRates({
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
      <NetworkSelector
        networks={supportedNetworksConfig}
        selectedNetwork={selectedChainId}
        setSelectedNetwork={setSelectedChainId}
      />
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
          />
          <AssetInput
            assets={networkReserves}
            value={
              normalizeBN(
                paraswapSellRates?.destAmount || 0,
                selectedOutputReserve.decimals
              ).toString() || '0'
            }
            usdValue={paraswapSellRates?.destUSD || '0'}
            symbol={selectedOutputReserve?.symbol}
            loading={paraswapRatesLoading}
            onSelect={setSelectedOutputReserve}
          />
        </>
      )}
    </>
  );
};
