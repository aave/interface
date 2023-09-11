import { ReserveDataHumanized, ReservesDataHumanized } from '@aave/contract-helpers';
import { normalize, normalizeBN } from '@aave/math-utils';
import { useMemo } from 'react';
import { useParaswapSellRates } from 'src/hooks/paraswap/useParaswapRates';
import { usePoolsReservesHumanized } from 'src/hooks/pool/usePoolReserves';
import { usePoolsTokensBalance } from 'src/hooks/pool/usePoolTokensBalance';
import { MarketDataType, marketsData } from 'src/utils/marketsAndNetworksConfig';

const flattenNetworkReserves = (reserves: ReservesDataHumanized[]): ReserveDataHumanized[] => {
  return reserves.reduce((acc, elem) => {
    return acc.concat(elem.reservesData);
  }, [] as ReserveDataHumanized[]);
};

const flattenArray = <T>(doubleArray: T[][]): T[] => {
  return doubleArray.reduce((acc, elem) => {
    return acc.concat(elem);
  }, [] as T[]);
};

interface Reserve {
  underlyingAsset: string;
  decimals: number;
}
interface UseSwitchLogicParams {
  selectedChainId: number;
  user: string;
  inputReserve?: Reserve;
  outputReserve?: Reserve;
  inputAmount: string;
}

interface ReserveWithBalance extends ReserveDataHumanized {
  balance: string;
}

export const useSwitchLogic = ({
  selectedChainId,
  user,
  inputAmount,
  inputReserve,
  outputReserve,
}: UseSwitchLogicParams) => {
  const marketsBySupportedNetwork = useMemo(
    () =>
      Object.values(marketsData)
        .filter((elem) => elem.chainId === selectedChainId && elem.enabledFeatures?.switch)
        .reduce((acum, elem) => {
          if (acum.find((acumElem) => acumElem.chainId === elem.chainId)) return acum;
          return acum.concat(elem);
        }, [] as MarketDataType[]),
    [selectedChainId]
  );

  const { data: networkReserves, isLoading: networkReservesLoading } = usePoolsReservesHumanized(
    marketsBySupportedNetwork,
    { select: flattenNetworkReserves, refetchInterval: 0 }
  );

  const { data: poolsBalance, isLoading: poolsBalanceLoading } = usePoolsTokensBalance(
    marketsBySupportedNetwork,
    user,
    {
      refetchInterval: 0,
      select: flattenArray,
    }
  );

  const reservesLoading = poolsBalanceLoading || networkReservesLoading;

  const {
    data: sellRates,
    isLoading: ratesLoading,
    error: ratesError,
  } = useParaswapSellRates({
    chainId: selectedChainId,
    amount: normalizeBN(inputAmount, -1 * (inputReserve?.decimals || 0)).toFixed(0),
    srcToken: inputReserve?.underlyingAsset,
    srcDecimals: inputReserve?.decimals,
    destToken: outputReserve?.underlyingAsset,
    destDecimals: outputReserve?.decimals,
    user,
  });

  const reservesWithBalance: ReserveWithBalance[] = useMemo(() => {
    if (!networkReserves || !poolsBalance) return [];
    return networkReserves.map((elem) => {
      return {
        ...elem,
        balance: normalize(
          poolsBalance
            .find((balance) => balance.address === elem.underlyingAsset)
            ?.amount.toString() || '0',
          elem.decimals
        ),
      };
    });
  }, [networkReserves, poolsBalance]);

  return { sellRates, reservesLoading, reservesWithBalance, ratesLoading, ratesError };
};
