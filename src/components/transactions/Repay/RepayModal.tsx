import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import React, { useState } from 'react';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';

import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { RepayWithCollateralModalContent } from '../Swap/modals/request/RepayWithCollateralModalContent';
import { RepayModalContent } from './RepayModalContent';
import { RepayType, RepayTypeSelector } from './RepayTypeSelector';

export const RepayModal = () => {
  const { type, close, args, mainTxState } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
    currentRateMode: InterestRate;
    isFrozen: boolean;
  }>;
  const { userReserves } = useAppDataContext();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const [repayType, setRepayType] = useState(RepayType.BALANCE);

  // repay with collateral is only possible:
  // 1. on chains with paraswap deployed
  // 2. when you have a different supplied(not necessarily collateral) asset then the one your debt is in
  // For repaying your debt with the same assets aToken you can use repayWithAToken on aave protocol v3
  const collateralRepayPossible =
    isFeatureEnabled.collateralRepay(currentMarketData) &&
    userReserves.some(
      (userReserve) =>
        userReserve.scaledATokenBalance !== '0' &&
        userReserve.underlyingAsset !== args.underlyingAsset
    );

  const handleClose = () => {
    setRepayType(RepayType.BALANCE);
    close();
  };

  return (
    <BasicModal open={type === ModalType.Repay} setOpen={handleClose}>
      <ModalWrapper title={<Trans>Repay</Trans>} underlyingAsset={args.underlyingAsset}>
        {(params) => {
          return (
            <UserAuthenticated>
              {(user) => (
                <>
                  {collateralRepayPossible && !mainTxState.txHash && (
                    <RepayTypeSelector repayType={repayType} setRepayType={setRepayType} />
                  )}
                  {repayType === RepayType.BALANCE && <RepayModalContent {...params} user={user} />}
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
      </ModalWrapper>
    </BasicModal>
  );
};
