import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import React, { useState } from 'react';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';

import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapperSDK } from '../FlowCommons/ModalWrapperSDK';
import { RepayWithCollateralModalContent } from '../Swap/modals/request/RepayWithCollateralModalContent';
import { RepayModalContentSDK } from './RepayModalContentSDK';
import { RepayType, RepayTypeSelector } from './RepayTypeSelector';

export const RepayModalSDK = () => {
  const { type, close, args, mainTxState } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
    currentRateMode: InterestRate;
    isFrozen: boolean;
  }>;
  const { supplyReserves } = useAppDataContext();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const [repayType, setRepayType] = useState(RepayType.BALANCE);

  // repay with collateral is only possible:
  // 1. on chains with paraswap deployed
  // 2. when you have a different supplied(not necessarily collateral) asset then the one your debt is in
  // For repaying your debt with the same assets aToken you can use repayWithAToken on aave protocol v3

  const collateralRepayPossible =
    args?.underlyingAsset &&
    isFeatureEnabled.collateralRepay(currentMarketData) &&
    supplyReserves.some((r) => {
      const hasBalance = Number(r.userState?.balance.amount.value ?? '0') > 0;
      const isDifferentAsset =
        r.underlyingToken.address.toLowerCase() !== args?.underlyingAsset.toLowerCase();
      return hasBalance && isDifferentAsset;
    });

  const handleClose = () => {
    setRepayType(RepayType.BALANCE);
    close();
  };

  return (
    <BasicModal open={type === ModalType.RepaySDK} setOpen={handleClose}>
      <ModalWrapperSDK title={<Trans>Repay</Trans>} underlyingAsset={args?.underlyingAsset ?? ''}>
        {(params) => {
          return (
            <UserAuthenticated>
              {(user) => (
                <>
                  {collateralRepayPossible && !mainTxState.txHash && (
                    <RepayTypeSelector repayType={repayType} setRepayType={setRepayType} />
                  )}
                  {repayType === RepayType.BALANCE && (
                    <RepayModalContentSDK {...params} user={user} />
                  )}
                  {repayType === RepayType.COLLATERAL && (
                    <RepayWithCollateralModalContent
                      {...params}
                      debtType={args.currentRateMode}
                      underlyingAsset={args.underlyingAsset}
                    />
                  )}
                </>
              )}
            </UserAuthenticated>
          );
        }}
      </ModalWrapperSDK>
    </BasicModal>
  );
};
