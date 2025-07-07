import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

import {
  UmbrellaClaimAllModalContent,
  UmbrellaClaimModalContent,
} from './UmbrellaClaimModalContent';

export const UmbrellaClaimModal = () => {
  const { type, close, args } = useModalContext();
  const currentMarketData = useRootStore((store) => store.currentMarketData);

  const { data } = useUmbrellaSummary(currentMarketData);

  const stakeData = data?.stakeData.find(
    (item) => item.tokenAddress.toLowerCase() === args?.uStakeToken?.toLowerCase()
  );

  return (
    <BasicModal
      open={type === ModalType.UmbrellaClaim || type === ModalType.UmbrellaClaimAll}
      setOpen={close}
    >
      <UserAuthenticated>
        {(user) => {
          if (type === ModalType.UmbrellaClaim && stakeData) {
            return <UmbrellaClaimModalContent user={user} stakeData={stakeData} />;
          }

          if (type === ModalType.UmbrellaClaimAll && data?.stakeData) {
            return <UmbrellaClaimAllModalContent stakeData={data.stakeData} />;
          }
        }}
      </UserAuthenticated>
    </BasicModal>
  );
};
