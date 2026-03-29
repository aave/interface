import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { Warning } from 'src/components/primitives/Warning';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useZeroLTVBlockingWithdraw } from 'src/hooks/useZeroLTVBlockingWithdraw';
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

  const assetsBlockingWithdraw = useZeroLTVBlockingWithdraw();
  const hasZeroLTVBlocking = assetsBlockingWithdraw.length > 0;

  const collateralRepayPossible =
    isFeatureEnabled.collateralRepay(currentMarketData) &&
    userReserves.some(
      (userReserve) =>
        userReserve.scaledATokenBalance !== '0' &&
        userReserve.underlyingAsset !== args.underlyingAsset
    );

  const collateralRepayBlocked = collateralRepayPossible && hasZeroLTVBlocking;

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
                    <RepayTypeSelector
                      repayType={repayType}
                      setRepayType={setRepayType}
                      collateralDisabled={collateralRepayBlocked}
                    />
                  )}
                  {collateralRepayBlocked && (
                    <Warning severity="warning" sx={{ mt: 2, mb: 2 }}>
                      <Typography variant="caption">
                        <Trans>
                          Repay with collateral is unavailable because you have assets with zero LTV
                          ({assetsBlockingWithdraw.join(', ')}) enabled as collateral. Withdraw or
                          disable them as collateral first.
                        </Trans>
                      </Typography>
                    </Warning>
                  )}
                  {repayType === RepayType.BALANCE && <RepayModalContent {...params} user={user} />}
                  {repayType === RepayType.COLLATERAL && !collateralRepayBlocked && (
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
