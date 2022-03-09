import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import React from 'react';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { BasicModal } from '../../primitives/BasicModal';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { RepayModalContent } from './RepayModalContent';

export interface ReserveModalProps {
  underlyingAsset: string;
  poolReserve: ComputedReserveData;
  userReserve: ComputedUserReserveData;
  symbol: string;
  tokenBalance: string;
  nativeBalance: string;
  isWrongNetwork: boolean;
}

const ReserveProvider: React.FC<{
  underlyingAsset: string;
  Content: (params: ReserveModalProps) => JSX.Element;
  requiredChainId?: number;
}> = ({ underlyingAsset, Content, requiredChainId: _requiredChainId }) => {
  const { chainId: connectedChainId } = useWeb3Context();
  const { walletBalances } = useWalletBalances();
  const { currentChainId: marketChainId, currentNetworkConfig } = useProtocolDataContext();
  const { reserves, user } = useAppDataContext();

  const requiredChainId = _requiredChainId ? _requiredChainId : marketChainId;
  const isWrongNetwork = connectedChainId !== requiredChainId;

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  const userReserve = user?.userReservesData.find(
    (userReserve) => underlyingAsset === userReserve.underlyingAsset
  ) as ComputedUserReserveData;

  const symbol = poolReserve.isWrappedBaseAsset
    ? currentNetworkConfig.baseAssetSymbol
    : poolReserve.symbol;
  return (
    <>
      <TxModalTitle title="Repay" symbol={symbol} />
      {isWrongNetwork && (
        <ChangeNetworkWarning
          networkName={getNetworkConfig(requiredChainId).name}
          chainId={requiredChainId}
        />
      )}
      <Content
        poolReserve={poolReserve}
        userReserve={userReserve}
        underlyingAsset={underlyingAsset}
        symbol={symbol}
        tokenBalance={walletBalances[poolReserve.underlyingAsset].amount}
        nativeBalance={walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()].amount}
        isWrongNetwork={isWrongNetwork}
      />
    </>
  );
};

export const RepayModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{ underlyingAsset: string }>;

  return (
    <BasicModal open={type === ModalType.Repay} setOpen={close}>
      <ReserveProvider underlyingAsset={args.underlyingAsset} Content={RepayModalContent} />
    </BasicModal>
  );
};
