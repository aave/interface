import { Trans } from '@lingui/macro';
import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalWrapper } from 'src/components/transactions/FlowCommons/ModalWrapper';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { zeroAddress } from 'viem';

import { UmbrellaModalContent } from './UmbrellaModalContent';

export const UmbrellaModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    stataTokenAsset: string;
    underlyingTokenAddress: string;
    uStakeToken: string;
    icon: string;
  }>;

  const currentMarketData = useRootStore((store) => store.currentMarketData);

  const { data } = useUmbrellaSummary(currentMarketData);

  const stakeData = data?.stakeData.find(
    (item) => item.tokenAddress.toLowerCase() === args?.uStakeToken?.toLowerCase()
  );

  const underlyingAsset =
    args.stataTokenAsset === zeroAddress
      ? args.underlyingTokenAddress.toLowerCase()
      : args.stataTokenAsset?.toLowerCase();

  return (
    <BasicModal open={type === ModalType.Umbrella} setOpen={close}>
      <ModalWrapper title={<Trans>Stake</Trans>} underlyingAsset={underlyingAsset}>
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
