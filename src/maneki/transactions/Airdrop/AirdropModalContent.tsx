import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { ethers } from 'ethers';

import {
  DetailsNumberLine,
  TxModalDetails,
} from '../../../components/transactions/FlowCommons/TxModalDetails';
import { TxModalTitle } from '../../../components/transactions/FlowCommons/TxModalTitle';
import { useAirdropContext } from '../../hooks/airdrop-data-provider/AirdropDataProvider';
import { AirdropActions } from './AirdropActions';

export const AirdropModalContent = () => {
  const { entryAmount, entryAmountSocmed, currentSelectedAirdrop } = useAirdropContext();
  const trueValue = currentSelectedAirdrop == 0 ? entryAmount : entryAmountSocmed;
  return (
    <Box>
      <TxModalTitle title={<Trans>Claim airdrop</Trans>} />
      <TxModalDetails gasLimit={'500000'}>
        <DetailsNumberLine
          description={<Trans>Amount</Trans>}
          iconSymbol={'PAW'}
          symbol={'PAW'}
          value={ethers.BigNumber.from(trueValue.substring(0, trueValue.length - 1))
            .div(ethers.BigNumber.from('1000000000000000000'))
            .toString()}
        />
      </TxModalDetails>
      <AirdropActions
        amountToAirdrop={trueValue.toString()}
        isWrongNetwork={false} // TODO need to check this
        blocked={false}
        symbol="PAW"
      />
    </Box>
  );
};
