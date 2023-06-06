import { Trans } from '@lingui/macro';
import { utils } from 'ethers';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { ManekiModalWrapper } from 'src/maneki/components/ManekiModalWrapper';

import { ManageClaimAll } from './ManageClaimAll';
import { ManageClaimAllVest } from './ManageClaimAllVest';
import { ManageClaimExpired } from './ManageClaimExpired';
import { ManageClaimUnlock } from './ManageClaimUnlock';
import { ManageModalContent } from './ManageModalContent';

export const ManageModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <>
      {type == ModalType.ManageStake && (
        <BasicModal open={type === ModalType.ManageStake} setOpen={close}>
          <ManekiModalWrapper
            title={<Trans>Stake</Trans>}
            symbol={'PAW'}
            action={'Staked'}
            amount={args.manageAmount}
          >
            {(params) => <ManageModalContent {...params} amount={args.manageAmount || '0'} />}
          </ManekiModalWrapper>
        </BasicModal>
      )}
      {type == ModalType.ManageLock && (
        <BasicModal open={type === ModalType.ManageLock} setOpen={close}>
          <ManekiModalWrapper
            title={<Trans>Lock</Trans>}
            symbol={'PAW'}
            action={'Locked'}
            amount={args.manageAmount}
          >
            {(params) => <ManageModalContent {...params} amount={args.manageAmount || '0'} />}
          </ManekiModalWrapper>
        </BasicModal>
      )}
      {type == ModalType.ManageClaimUnlock && (
        <BasicModal open={type === ModalType.ManageClaimUnlock} setOpen={close}>
          {/* Do something here for claims */}
          <ManekiModalWrapper
            title={<Trans>Claim</Trans>}
            symbol={'PAW'}
            action={'Claimed'}
            amount={args.manageAmount && utils.formatUnits(args.manageAmount, 18)}
          >
            {(params) => <ManageClaimUnlock {...params} amount={args.manageAmount || '0'} />}
          </ManekiModalWrapper>
        </BasicModal>
      )}
      {type == ModalType.ManageClaimAllVest && (
        <BasicModal open={type === ModalType.ManageClaimAllVest} setOpen={close}>
          {/* Do something here for claims */}
          <ManekiModalWrapper
            title={<Trans>Claim</Trans>}
            symbol={'PAW'}
            action={'Claimed'}
            amount={args.manageAmount && utils.formatUnits(args.manageAmount, 18)}
          >
            {(params) => <ManageClaimAllVest {...params} />}
          </ManekiModalWrapper>
        </BasicModal>
      )}
      {type == ModalType.ManageClaimExpired && (
        <BasicModal open={type === ModalType.ManageClaimExpired} setOpen={close}>
          {/* Do something here for claims */}
          <ManekiModalWrapper
            title={<Trans>Claim</Trans>}
            symbol={'PAW'}
            action={'Claimed'}
            amount={args.manageAmount && utils.formatUnits(args.manageAmount, 18)}
          >
            {(params) => <ManageClaimExpired {...params} />}
          </ManekiModalWrapper>
        </BasicModal>
      )}
      {type == ModalType.ManageClaimAll && (
        <BasicModal open={type === ModalType.ManageClaimAll} setOpen={close}>
          {/* Do something here for claims */}
          <ManekiModalWrapper
            title={<Trans>Claim</Trans>}
            symbol={'PAW'}
            amount={args.manageAmount}
          >
            {(params) => <ManageClaimAll {...params} />}
          </ManekiModalWrapper>
        </BasicModal>
      )}
    </>
  );
};
