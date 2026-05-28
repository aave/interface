import { Trans } from '@lingui/macro';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { SGhoVaultDepositModalContent } from './SGhoVaultDepositModalContent';

export const SGhoVaultDepositModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  return (
    <BasicModal open={type === ModalType.SGhoVaultDeposit} setOpen={close}>
      <ModalWrapper
        title={<Trans>Deposit GHO into sGHO</Trans>}
        underlyingAsset={args.underlyingAsset}
        hideTitleSymbol
      >
        {() => <SGhoVaultDepositModalContent />}
      </ModalWrapper>
    </BasicModal>
  );
};
