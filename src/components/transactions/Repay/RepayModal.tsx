import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import React, { useState } from 'react';
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
  const [repayType, setRepayType] = useState(RepayType.BALANCE);
  return (
    <BasicModal open={type === ModalType.Repay} setOpen={close}>
      <ModalWrapper title={<Trans>Repay</Trans>} underlyingAsset={args.underlyingAsset}>
        {(params) => {
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
        }}
      </ModalWrapper>
    </BasicModal>
  );
};
