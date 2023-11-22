import React from 'react';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { ClaimRewardsModalContent } from './ClaimRewardsModalContent';

export const ClaimRewardsModal = () => {
  const { type, close } = useModalContext();
  const { reserves } = useAppDataContext();
  return (
    <BasicModal open={type === ModalType.ClaimRewards} setOpen={close}>
      <UserAuthenticated>
        {(user) => <ClaimRewardsModalContent user={user} reserves={reserves} />}
      </UserAuthenticated>
    </BasicModal>
  );
};
