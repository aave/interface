import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { DebtSwitchModalContent } from './DebtSwitchModalContent';

export const DebtSwitchModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
    currentRateMode: InterestRate;
  }>;
  return (
    <BasicModal open={type === ModalType.DebtSwitch} setOpen={close}>
      <ModalWrapper
        title={<Trans>Switch borrow position</Trans>}
        underlyingAsset={args.underlyingAsset}
        hideTitleSymbol
      >
        {(params) => (
          <UserAuthenticated>
            {(user) => (
              <DebtSwitchModalContent
                {...params}
                currentRateMode={args.currentRateMode}
                user={user}
              />
            )}
          </UserAuthenticated>
        )}
      </ModalWrapper>
    </BasicModal>
  );
};
