import { InterestRate } from '@aave/contract-helpers';
import { UserReserveData } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import React, { useState } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { CollateralRepayModalContent } from './CollateralRepayModalContent';
import { RepayModalContent } from './RepayModalContent';
import { RepayType, RepayTypeSelector } from './RepayTypeSelector';

export const RepayModal = () => {
  const { type, close, args, mainTxState } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
    currentRateMode: InterestRate;
  }>;
  const { userReserves } = useAppDataContext();
  const [repayType, setRepayType] = useState(RepayType.BALANCE);

  let supplies: string[] = [];
  if (userReserves.length > 0) {
    supplies = userReserves
      .filter((userReserve: UserReserveData) => userReserve.scaledATokenBalance !== '0')
      .map((userReserve: UserReserveData) => userReserve.underlyingAsset.toLowerCase());
  }

  console.log('user reserves ', userReserves);

  return (
    <BasicModal open={type === ModalType.Repay} setOpen={close}>
      <ModalWrapper title={<Trans>Repay</Trans>} underlyingAsset={args.underlyingAsset}>
        {(params) => {
          const remainingSupplies = supplies.filter(
            (address: string) => address !== params.underlyingAsset.toLowerCase()
          );

          if (remainingSupplies.length > 0) {
            return (
              <>
                {!mainTxState.txHash && (
                  <RepayTypeSelector repayType={repayType} setRepayType={setRepayType} />
                )}
                {repayType === RepayType.BALANCE && (
                  <RepayModalContent {...params} debtType={args.currentRateMode} />
                )}
                {repayType === RepayType.COLLATERAL && (
                  <CollateralRepayModalContent {...params} debtType={args.currentRateMode} />
                )}
              </>
            );
          }

          return <RepayModalContent {...params} debtType={args.currentRateMode} />;
        }}
      </ModalWrapper>
    </BasicModal>
  );
};
