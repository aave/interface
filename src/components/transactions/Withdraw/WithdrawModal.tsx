import { PERMISSION } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import React, { useState } from 'react';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { WithdrawAndSwapModalContent } from './WithdrawAndSwapModalContent';
import { WithdrawModalContent } from './WithdrawModalContent';
import { WithdrawType, WithdrawTypeSelector } from './WithdrawTypeSelector';

export const WithdrawModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  const [withdrawUnWrapped, setWithdrawUnWrapped] = useState(true);
  const [withdrawType, setWithdrawType] = useState(WithdrawType.WITHDRAW);

  return (
    <BasicModal open={type === ModalType.Withdraw} setOpen={close}>
      <ModalWrapper
        title={<Trans>Withdraw</Trans>}
        underlyingAsset={args.underlyingAsset}
        keepWrappedSymbol={!withdrawUnWrapped}
        requiredPermission={PERMISSION.DEPOSITOR}
      >
        {(params) => (
          <>
            <WithdrawTypeSelector withdrawType={withdrawType} setWithdrawType={setWithdrawType} />
            {withdrawType === WithdrawType.WITHDRAW && (
              <WithdrawModalContent
                {...params}
                unwrap={withdrawUnWrapped}
                setUnwrap={setWithdrawUnWrapped}
              />
            )}
            {withdrawType === WithdrawType.WITHDRAWSWAP && (
              <>
                <WithdrawAndSwapModalContent
                  {...params}
                  unwrap={withdrawUnWrapped}
                  setUnwrap={setWithdrawUnWrapped}
                />
              </>
            )}
          </>
        )}
      </ModalWrapper>
    </BasicModal>
  );
};
