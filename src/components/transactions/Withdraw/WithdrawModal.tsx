import { Trans } from '@lingui/macro';
import React, { useState } from 'react';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { getGhoReserve, GHO_SWITCH_FEATURE_MARKETS } from 'src/utils/ghoUtilities';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';

import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { WithdrawAndSwitchModalContent } from './WithdrawAndSwitchModalContent';
import { WithdrawModalContent } from './WithdrawModalContent';
import { WithdrawType, WithdrawTypeSelector } from './WithdrawTypeSelector';

export const WithdrawModal = () => {
  const { type, close, args, mainTxState } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  const [withdrawUnWrapped, setWithdrawUnWrapped] = useState(true);
  const [withdrawType, setWithdrawType] = useState(WithdrawType.WITHDRAW);
  const { currentMarketData } = useProtocolDataContext();
  const { reserves } = useAppDataContext();

  const ghoReserve = getGhoReserve(reserves);
  const isGho = args.underlyingAsset === ghoReserve?.underlyingAsset;

  const isWithdrawAndSwapPossible =
    isFeatureEnabled.withdrawAndSwitch(currentMarketData) &&
    (!isGho || (isGho && GHO_SWITCH_FEATURE_MARKETS.includes(currentMarketData.marketTitle)));

  const handleClose = () => {
    setWithdrawType(WithdrawType.WITHDRAW);
    close();
  };

  return (
    <BasicModal open={type === ModalType.Withdraw} setOpen={handleClose}>
      <ModalWrapper
        title={<Trans>Withdraw</Trans>}
        underlyingAsset={args.underlyingAsset}
        keepWrappedSymbol={!withdrawUnWrapped}
      >
        {(params) => (
          <UserAuthenticated>
            {(user) => (
              <>
                {isWithdrawAndSwapPossible && !mainTxState.txHash && (
                  <WithdrawTypeSelector
                    withdrawType={withdrawType}
                    setWithdrawType={setWithdrawType}
                  />
                )}
                {withdrawType === WithdrawType.WITHDRAW && (
                  <WithdrawModalContent
                    {...params}
                    unwrap={withdrawUnWrapped}
                    setUnwrap={setWithdrawUnWrapped}
                    user={user}
                  />
                )}
                {withdrawType === WithdrawType.WITHDRAWSWITCH && (
                  <>
                    <WithdrawAndSwitchModalContent {...params} user={user} />
                  </>
                )}
              </>
            )}
          </UserAuthenticated>
        )}
      </ModalWrapper>
    </BasicModal>
  );
};
