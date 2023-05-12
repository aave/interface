import { Trans } from '@lingui/macro';
import { BigNumber, Contract } from 'ethers';
import { useEffect, useState } from 'react';
import {
  DetailsNumberLine,
  TxModalDetails,
} from 'src/components/transactions/FlowCommons/TxModalDetails';
// import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
// import MULTI_FEE_ABI from 'src/maneki/modules/manage/MultiFeeABI';
import PAW_TOKEN_ABI from 'src/maneki/modules/manage/PAWTokenABI';
import { toWeiString } from 'src/maneki/modules/manage/utils/stringConverter';
import { ManekiModalChildProps } from 'src/maneki/utils/ManekiModalWrapper';
import { marketsData } from 'src/ui-config/marketsConfig';

import { ManageStakeActions } from './ManageStakeActions';

export const ManageModalContent = ({
  symbol,
  isWrongNetwork,
  amount,
}: ManekiModalChildProps & { amount: string }) => {
  const { provider, currentAccount } = useWeb3Context();
  // const { mainTxState, setMainTxState, setTxError, approvalTxState, setApprovalTxState } =
  //   useModalContext();
  const [requiresApproval, setRequiresApproval] = useState<boolean>(false);
  const PAW_TOKEN_ADDR = marketsData.bsc_testnet_v3.addresses.PAW_TOKEN as string;
  const MULTI_FEE_ADDR = marketsData.bsc_testnet_v3.addresses.COLLECTOR as string;
  // const MANEKI_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
  //   .STAKING_DATA_PROVIDER as string;

  useEffect(() => {
    // const signer = provider?.getSigner(currentAccount as string);
    // const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, signer);
    const pawContract = new Contract(PAW_TOKEN_ADDR, PAW_TOKEN_ABI, provider);
    Promise.resolve(pawContract.allowance(currentAccount, MULTI_FEE_ADDR) as BigNumber).then(
      (value) => {
        if (value.lt(BigNumber.from(toWeiString(amount)))) {
          setRequiresApproval(true);
        }
      }
    );
  }, []);

  const handleApproval = async () => {
    const signer = provider?.getSigner(currentAccount as string);
    const pawContract = new Contract(PAW_TOKEN_ADDR, PAW_TOKEN_ABI, signer);
    await pawContract.approve(currentAccount, BigNumber.from(toWeiString(amount)));
  };
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
      <ManageStakeActions
        symbol={symbol}
        amount={amount}
        isWrongNetwork={isWrongNetwork}
        requiresApproval={requiresApproval}
        handleApproval={handleApproval}
      />
    </>
  );
};
