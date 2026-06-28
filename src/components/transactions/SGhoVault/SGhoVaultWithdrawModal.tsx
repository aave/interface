import { Trans } from '@lingui/macro';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { SGhoVaultWithdrawModalContent } from './SGhoVaultWithdrawModalContent';

export const SGhoVaultWithdrawModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  return (
    <BasicModal open={type === ModalType.SGhoVaultWithdraw} setOpen={close}>
      <ModalWrapper
        title={<Trans>Withdraw sGHO</Trans>}
        underlyingAsset={args.underlyingAsset}
        hideTitleSymbol
      >
        {() => <SGhoVaultWithdrawModalContent />}
      </ModalWrapper>
    </BasicModal>
  );
};
