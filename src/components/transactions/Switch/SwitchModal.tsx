import React, { useState } from 'react';
import { usePoolsReservesHumanized } from 'src/hooks/pool/usePoolReserves';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { BaseNetworkConfig } from 'src/ui-config/networksConfig';
import {
  availableMarkets,
  ENABLE_TESTNET,
  getSupportedChainIds,
  marketsData,
  networkConfigs as _networkConfigs,
  networkConfigs,
} from 'src/utils/marketsAndNetworksConfig';

import { BasicModal } from '../../primitives/BasicModal';
import { AssetInput } from '../AssetInput';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { NetworkSelector } from './NetworkSelector';

export const SwitchModal = () => {
  const { type, close } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  const [inputAmount, setInputAmount] = useState(0);
  const currentChainId = useRootStore((state) => state.currentChainId);
  const [selectedNetwork, setSelectedNetwork] = useState(() => _networkConfigs[currentChainId]);
  const supportedNetworksConfig = getSupportedChainIds().map((chainId) => networkConfigs[chainId]);

  return (
    <BasicModal open={type === ModalType.Switch} setOpen={close}>
      <TxModalTitle title="Switch tokens" />
      <NetworkSelector
        networks={supportedNetworksConfig}
        selectedNetwork={selectedNetwork}
        setSelectedNetwork={setSelectedNetwork}
      />
      {/*
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
        */}
    </BasicModal>
  );
};
