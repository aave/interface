import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';

import {
  DetailsNumberLine,
  TxModalDetails,
} from '../../../components/transactions/FlowCommons/TxModalDetails';
import { TxModalTitle } from '../../../components/transactions/FlowCommons/TxModalTitle';
import { useAirdropContext } from '../../hooks/airdrop-data-provider/AirdropDataProvider';
import { AirdropActions } from './AirdropActions';

export const AirdropModalContent = () => {
  const { entryAmount } = useAirdropContext();

  return (
    <Box>
      <TxModalTitle title={<Trans>Claim airdrop</Trans>} />
      <TxModalDetails gasLimit={'500000'}>
        <DetailsNumberLine
          description={<Trans>Amount</Trans>}
          iconSymbol={'PAW'}
          symbol={'PAW'}
          value={entryAmount / 1000000000000000000}
        />
      </TxModalDetails>
      <AirdropActions
        amountToAirdrop={entryAmount.toString()}
        isWrongNetwork={false} // TODO need to check this
        blocked={false}
        symbol="PAW"
      />
    </Box>
  );
};
