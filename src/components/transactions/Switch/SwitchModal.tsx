import { API_ETH_MOCK_ADDRESS, ReserveDataHumanized } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Box, CircularProgress } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { usePoolsReservesHumanized } from 'src/hooks/pool/usePoolReserves';
import { usePoolsTokensBalance } from 'src/hooks/pool/usePoolTokensBalance';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { UserPoolTokensBalances } from 'src/services/WalletBalanceService';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { CustomMarket, getNetworkConfig, marketsData } from 'src/utils/marketsAndNetworksConfig';

import { BasicModal } from '../../primitives/BasicModal';
import { supportedNetworksWithEnabledMarket } from './common';
import { SwitchModalContent } from './SwitchModalContent';

export interface ReserveWithBalance extends ReserveDataHumanized {
  balance: string;
}

const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];

export const SwitchModal = () => {
  const {
    type,
    close,
    args: { underlyingAsset },
  } = useModalContext();

  const currentChainId = useRootStore((store) => store.currentChainId);
  const user = useRootStore((store) => store.account);

  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === currentChainId))
      return currentChainId;
    return defaultNetwork.chainId;
  });

  const selectedNetworkConfig = getNetworkConfig(selectedChainId);

  useEffect(() => {
    if (supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === currentChainId))
      setSelectedChainId(currentChainId);
    else {
      setSelectedChainId(defaultNetwork.chainId);
    }
  }, [currentChainId]);

  const marketsBySupportedNetwork = useMemo(
    () =>
      Object.values(marketsData).filter(
        (elem) => elem.chainId === selectedChainId && elem.enabledFeatures?.switch
      ),
    [selectedChainId]
  );

  const poolReservesDataQueries = usePoolsReservesHumanized(marketsBySupportedNetwork, {
    refetchInterval: 0,
  });

  const networkReserves = poolReservesDataQueries.reduce((acum, elem) => {
    if (elem.data) {
      const wrappedBaseAsset = elem.data.reservesData.find(
        (reserveData) => reserveData.symbol === selectedNetworkConfig.wrappedBaseAssetSymbol
      );
      const acumWithoutBaseAsset = acum.concat(
        elem.data.reservesData.filter(
          (reserveDataElem) =>
            !acum.find((acumElem) => acumElem.underlyingAsset === reserveDataElem.underlyingAsset)
        )
      );
      if (
        wrappedBaseAsset &&
        !acum.find((acumElem) => acumElem.underlyingAsset === API_ETH_MOCK_ADDRESS)
      )
        return acumWithoutBaseAsset.concat({
          ...wrappedBaseAsset,
          underlyingAsset: API_ETH_MOCK_ADDRESS,
          decimals: selectedNetworkConfig.baseAssetDecimals,
          ...fetchIconSymbolAndName({
            underlyingAsset: API_ETH_MOCK_ADDRESS,
            symbol: selectedNetworkConfig.baseAssetSymbol,
          }),
        });
      return acumWithoutBaseAsset;
    }
    return acum;
  }, [] as ReserveDataHumanized[]);

  const poolBalancesDataQueries = usePoolsTokensBalance(marketsBySupportedNetwork, user, {
    refetchInterval: 0,
  });

  const poolsBalances = poolBalancesDataQueries.reduce((acum, elem) => {
    if (elem.data) return acum.concat(elem.data);
    return acum;
  }, [] as UserPoolTokensBalances[]);

  const reservesWithBalance: ReserveWithBalance[] = useMemo(() => {
    return networkReserves.map((elem) => {
      return {
        ...elem,
        ...fetchIconSymbolAndName({
          underlyingAsset: elem.underlyingAsset,
          symbol: elem.symbol,
          name: elem.name,
        }),
        balance: normalize(
          poolsBalances
            .find(
              (balance) =>
                balance.address.toLocaleLowerCase() === elem.underlyingAsset.toLocaleLowerCase()
            )
            ?.amount.toString() || '0',
          elem.decimals
        ),
      };
    });
  }, [networkReserves, poolsBalances]);

  const reserversWithBalanceSortedByBalance = reservesWithBalance.sort(
    (a, b) => Number(b.balance) - Number(a.balance)
  );

  return (
    <BasicModal open={type === ModalType.Switch} setOpen={close}>
      {reserversWithBalanceSortedByBalance.length > 1 ? (
        <SwitchModalContent
          key={selectedChainId}
          selectedChainId={selectedChainId}
          setSelectedChainId={setSelectedChainId}
          supportedNetworks={supportedNetworksWithEnabledMarket}
          reserves={reserversWithBalanceSortedByBalance}
          selectedNetworkConfig={selectedNetworkConfig}
          defaultAsset={underlyingAsset}
        />
      ) : (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: '60px' }}>
          <CircularProgress />
        </Box>
      )}
    </BasicModal>
  );
};
