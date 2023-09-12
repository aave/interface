import { ReserveDataHumanized } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import React, { useMemo, useState } from 'react';
import { usePoolsReservesHumanized } from 'src/hooks/pool/usePoolReserves';
import { usePoolsTokensBalance } from 'src/hooks/pool/usePoolTokensBalance';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { UserPoolTokensBalances } from 'src/services/WalletBalanceService';
import { useRootStore } from 'src/store/root';
import { CustomMarket, marketsData } from 'src/utils/marketsAndNetworksConfig';

import { BasicModal } from '../../primitives/BasicModal';
import { supportedNetworksWithEnabledMarket } from './common';
import { SwitchModalContent } from './SwitchModalContent';

export interface ReserveWithBalance extends ReserveDataHumanized {
  balance: string;
}

const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];

export const SwitchModal = () => {
  const { type, close } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  const currentChainId = useRootStore((store) => store.currentChainId);
  const user = useRootStore((store) => store.account);

  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === currentChainId))
      return currentChainId;
    return defaultNetwork.chainId;
  });

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
    if (elem.data)
      return acum.concat(
        elem.data.reservesData.filter(
          (reserveDataElem) =>
            !acum.find((acumElem) => acumElem.underlyingAsset === reserveDataElem.underlyingAsset)
        )
      );
    return acum;
  }, [] as ReserveDataHumanized[]);

  console.log(networkReserves);

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
        balance: normalize(
          poolsBalances
            .find((balance) => balance.address === elem.underlyingAsset)
            ?.amount.toString() || '0',
          elem.decimals
        ),
      };
    });
  }, [networkReserves, poolsBalances]);

  return (
    <BasicModal open={type === ModalType.Switch} setOpen={close}>
      {reservesWithBalance.length > 1 ? (
        <SwitchModalContent
          selectedChainId={selectedChainId}
          setSelectedChainId={setSelectedChainId}
          supportedNetworks={supportedNetworksWithEnabledMarket}
          reserves={reservesWithBalance}
        />
      ) : null}
    </BasicModal>
  );
};
