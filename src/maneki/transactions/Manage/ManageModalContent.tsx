import { Trans } from '@lingui/macro';
import {
  DetailsNumberLine,
  TxModalDetails,
} from 'src/components/transactions/FlowCommons/TxModalDetails';
import { ManekiModalChildProps } from 'src/maneki/utils/ManekiModalWrapper';

import { ManageStakeActions } from './ManageStakeActions';

export const ManageModalContent = ({
  symbol,
  isWrongNetwork,
  amount,
}: ManekiModalChildProps & { amount: string }) => {
  return (
    <>
      <TxModalDetails>
        <DetailsNumberLine
          description={<Trans>Amount</Trans>}
          value={amount}
          iconSymbol={symbol.toLowerCase()}
          symbol={symbol}
        />
      </TxModalDetails>
      <ManageStakeActions symbol={symbol} amount={amount} isWrongNetwork={isWrongNetwork} />
    </>
  );
};
