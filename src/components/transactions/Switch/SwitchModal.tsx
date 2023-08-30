import React, { useState } from 'react';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { AssetInput } from '../AssetInput';
import { useRootStore } from 'src/store/root';
import { usePoolReservesHumanized } from 'src/hooks/pool/usePoolReserves';
import { NetworkSelector } from './NetworkSelector';
import { ENABLE_TESTNET, networkConfigs } from 'src/utils/marketsAndNetworksConfig';

export const SwitchModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  const [inputAmount, setInputAmount] = useState(0);

  const networks = ENABLE_TESTNET ? Object.values(networkConfigs).filter(elem => elem.isTestnet) : Object.values(networkConfigs).filter(elem => !elem.isTestnet)

  console.log(networks)

  const { currentChainId } = useRootStore();

  const [selectedNetwork, setSelectedNetwork] = useState(() => networks.find(elem => elem.));

  const { data: reserves, isLoading, error } = usePoolReservesHumanized(selectedMarket);

  return (
    <BasicModal open={type === ModalType.Switch} setOpen={close}>
      <TxModalTitle title="Switch tokens" />
      <NetworkSelector />
        networks={networks}
      />
      {
        /*
          <AssetInput
            assets={inputReserves}
            value={inputAmount.toString()}
            usdValue='0'
            symbol='asd'
            loading={loading}
            onSelect={() => {}}
          />
          <AssetInput
            assets={inputReserves}
            value={"0"}
            usdValue='0'
            symbol='asd'
            loading={loading}
            onSelect={() => {}}
          />
        */
      }
    </BasicModal>
  );
};
