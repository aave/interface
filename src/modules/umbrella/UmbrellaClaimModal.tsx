import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { UmbrellaClaimModalContent } from './UmbrellaClaimModalContent';
import { useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { useRootStore } from 'src/store/root';

export const UmbrellaClaimModal = () => {
  const { type, close, args } = useModalContext();
  const currentMarketData = useRootStore((store) => store.currentMarketData);

  const { data } = useUmbrellaSummary(currentMarketData);

  const stakeData = data?.find(
    (item) => item.stakeToken.toLowerCase() === args?.uStakeToken?.toLowerCase()
  );

  return (
    <BasicModal open={type === ModalType.UmbrellaClaim} setOpen={close}>
      <UserAuthenticated>
        {(user) =>  stakeData && <UmbrellaClaimModalContent user={user} stakeData={stakeData} />}
      </UserAuthenticated>
    </BasicModal>
  );
};
