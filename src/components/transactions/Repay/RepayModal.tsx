import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import React, { useState } from 'react';
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
import { CollateralRepayModalContent } from './CollateralRepayModalContent';
import { RepayModalContent } from './RepayModalContent';
import { RepayType, RepayTypeSelector } from './RepayTypeSelector';

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
  requiredChainId?: number;
  children: (props: ReserveModalProps) => React.ReactNode;
}> = ({ underlyingAsset, children, requiredChainId: _requiredChainId }) => {
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
      {children({
        isWrongNetwork,
        nativeBalance: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()].amount,
        tokenBalance: walletBalances[poolReserve.underlyingAsset].amount,
        poolReserve,
        symbol,
        underlyingAsset,
        userReserve,
      })}
    </>
  );
};

export const RepayModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
    currentRateMode: InterestRate;
  }>;
  const [repayType, setRepayType] = useState(RepayType.BALANCE);
  return (
    <BasicModal open={type === ModalType.Repay} setOpen={close}>
      <ReserveProvider underlyingAsset={args.underlyingAsset}>
        {(params) => {
          return (
            <>
              <RepayTypeSelector repayType={repayType} setRepayType={setRepayType} />
              {repayType === RepayType.BALANCE && (
                <RepayModalContent {...params} debtType={args.currentRateMode} />
              )}
              {repayType === RepayType.COLLATERAL && (
                <CollateralRepayModalContent {...params} debtType={args.currentRateMode} />
              )}
            </>
          );
        }}
      </ReserveProvider>
    </BasicModal>
  );
};
