import { Trans } from '@lingui/macro';
import {
  DetailsNumberLine,
  TxModalDetails,
} from 'src/components/transactions/FlowCommons/TxModalDetails';
import { ManekiModalChildProps } from 'src/maneki/utils/ManekiModalWrapper';

import { ManageLockActions } from './ManageLockActions';
import { ManageStakeActions } from './ManageStakeActions';

export const ManageModalContent = ({
  symbol,
  isWrongNetwork,
  action,
  amount,
}: ManekiModalChildProps & { amount: string }) => {
  return (
    <>
      <TxModalDetails gasLimit={'500000'}>
        <DetailsNumberLine
          description={<Trans>Amount</Trans>}
          value={amount}
          iconSymbol={symbol.toLowerCase()}
          symbol={symbol}
        />
      </TxModalDetails>
      {action && action === 'Staked' && (
        <ManageStakeActions symbol={symbol} amount={amount} isWrongNetwork={isWrongNetwork} />
      )}
      {action && action === 'Locked' && (
        <ManageLockActions symbol={symbol} amount={amount} isWrongNetwork={isWrongNetwork} />
      )}
    </>
  );
};
