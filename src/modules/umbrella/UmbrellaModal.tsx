import { Trans } from '@lingui/macro';
import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalWrapper } from 'src/components/transactions/FlowCommons/ModalWrapper';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

import { UmbrellaModalContent } from './UmbrellaModalContent';

export const UmbrellaModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    waTokenUnderlying: string;
    uStakeToken: string;
    icon: string;
  }>;

  const currentMarketData = useRootStore((store) => store.currentMarketData);

  const { data } = useUmbrellaSummary(currentMarketData);

  const stakeData = data?.find(
    (item) => item.stakeToken.toLowerCase() === args?.uStakeToken?.toLowerCase()
  );

  return (
    <BasicModal open={type === ModalType.Umbrella} setOpen={close}>
      <ModalWrapper title={<Trans>Stake</Trans>} underlyingAsset={args.waTokenUnderlying}>
        {(params) => (
          <UserAuthenticated>
            {(user) =>
              args?.icon && stakeData ? (
                <UmbrellaModalContent
                  icon={args.icon}
                  user={user}
                  stakeData={stakeData}
                  {...params}
                />
              ) : null
            }
          </UserAuthenticated>
        )}
      </ModalWrapper>
    </BasicModal>
  );
};
