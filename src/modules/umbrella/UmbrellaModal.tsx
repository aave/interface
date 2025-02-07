import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
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
    waTokenUnderlying: string;
    uStakeToken: string;
    icon: string;
  }>;

  const currentMarketData = useRootStore((store) => store.currentMarketData);

  const { data } = useUmbrellaSummary(currentMarketData);

  const stakeData = data?.stakeData.find(
    (item) => item.stakeToken.toLowerCase() === args?.uStakeToken?.toLowerCase()
  );

  // If there is no waTokenUnderlying, then just use the mock address so there's no errors thrown.
  // The underlying asset is only needed in the case when dealing with waTokens anyway, in which
  // case we need to fetch the user reserves so we can calculate health factor changes on stake.
  const underlyingAsset =
    args.waTokenUnderlying === zeroAddress ? API_ETH_MOCK_ADDRESS : args.waTokenUnderlying;

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
