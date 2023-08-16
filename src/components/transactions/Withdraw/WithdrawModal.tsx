import { PERMISSION } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import React, { useState } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { getGhoReserve } from 'src/utils/ghoUtilities';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';

import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { WithdrawAndSwapModalContent } from './WithdrawAndSwapModalContent';
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

  const isWithdrawAndSwapPossible =
    isFeatureEnabled.withdrawAndSwap(currentMarketData) &&
    args.underlyingAsset !== ghoReserve?.underlyingAsset;

  return (
    <BasicModal open={type === ModalType.Withdraw} setOpen={close}>
      <ModalWrapper
        title={<Trans>Withdraw</Trans>}
        underlyingAsset={args.underlyingAsset}
        keepWrappedSymbol={!withdrawUnWrapped}
        requiredPermission={PERMISSION.DEPOSITOR}
      >
        {(params) => (
          <>
            {isWithdrawAndSwapPossible && !mainTxState.txHash && (
              <WithdrawTypeSelector withdrawType={withdrawType} setWithdrawType={setWithdrawType} />
            )}
            {withdrawType === WithdrawType.WITHDRAW && (
              <WithdrawModalContent
                {...params}
                unwrap={withdrawUnWrapped}
                setUnwrap={setWithdrawUnWrapped}
              />
            )}
            {withdrawType === WithdrawType.WITHDRAWSWAP && (
              <>
                <WithdrawAndSwapModalContent {...params} />
              </>
            )}
          </>
        )}
      </ModalWrapper>
    </BasicModal>
  );
};
