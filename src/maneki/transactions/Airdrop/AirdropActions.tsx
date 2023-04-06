import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { Contract } from 'ethers';
import { useEffect, useState } from 'react';

import { TxActionsWrapper } from '../../../components/transactions/TxActionsWrapper';
import { useModalContext } from '../../../hooks/useModal';
import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { TxAction } from '../../../ui-config/errorMapping';
import { marketsData } from '../../../ui-config/marketsConfig';
import { useAirdropContext } from '../../hooks/airdrop-data-provider/AirdropDataProvider';
import MERKLE_DIST_ABI from '../../modules/airdrop/MerkleDistAbi';

export interface AirdropActionProps extends BoxProps {
  amountToAirdrop: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
}

export const AirdropActions = ({
  amountToAirdrop,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  ...props
}: AirdropActionProps) => {
  const { mainTxState, setMainTxState, setTxError } = useModalContext();
  const { provider, currentAccount } = useWeb3Context();
  const airdropCtx = useAirdropContext();
  const [merkleDistContract, setMerkleDistContract] = useState<Contract | null>(null);

  const MERKLE_DIST_ADDR = marketsData.bsc_testnet_v3.addresses.MERKLE_DIST as string;

  // claim action
  const claimAction = async () => {
    if (!merkleDistContract) {
      setTxError({
        blocking: false,
        actionBlocked: false,
        error: <Trans>Cant get signer</Trans>,
        rawError: new Error('Cant get signer'),
        txAction: TxAction.MAIN_ACTION,
      });

      setMainTxState({
        loading: false,
      });
      return;
    }

    try {
      // console.log({
      //   claimIdx : airdropCtx.claimIndex,
      //   index : airdropCtx.index,
      //   entryAmount : airdropCtx.entryAmount.toString(),
      //   receiver : airdropCtx.receiver,
      //   proofs : airdropCtx.proofs
      //  })
      //  console.log(airdropCtx.proofs)
      let transanctionUnsigned;
      if (airdropCtx.currentSelectedAirdrop == 0) {
        transanctionUnsigned = await merkleDistContract.claim(
          airdropCtx.claimIndex,
          airdropCtx.index,
          airdropCtx.entryAmount.toString(),
          airdropCtx.receiver,
          airdropCtx.proofs
        );
        airdropCtx.setIsClaimed(true);
      } else {
        transanctionUnsigned = await merkleDistContract.claim(
          airdropCtx.claimIndexSocmed,
          airdropCtx.indexSocmed,
          airdropCtx.entryAmountSocmed.toString(),
          airdropCtx.receiverSocmed,
          airdropCtx.proofsSocmed
        );
        airdropCtx.setIsClaimedSocmed(true);
      }
      setMainTxState({
        loading: false,
        success: true,
        txHash: transanctionUnsigned.hash,
      });
    } catch (error) {
      console.log('====================================');
      console.log(error);
      console.log('====================================');
      setMainTxState({
        loading: false,
        success: false,
      });
      setTxError({
        blocking: false,
        actionBlocked: false,
        error: <Trans>Airdrop claim error</Trans>,
        rawError: error,
        txAction: TxAction.MAIN_ACTION,
      });
    }
  };

  // prepare contract
  useEffect(() => {
    if (!provider) {
      setTxError({
        blocking: false,
        actionBlocked: false,
        error: <Trans>Cant get signer</Trans>,
        rawError: new Error('Cant get signer'),
        txAction: TxAction.MAIN_ACTION,
      });

      setMainTxState({
        loading: false,
      });
      return;
    }

    const signer = provider.getSigner(currentAccount as string);
    setMerkleDistContract(new Contract(MERKLE_DIST_ADDR, MERKLE_DIST_ABI, signer));
    setMainTxState({
      loading: false,
    });
  }, []);

  return (
    <TxActionsWrapper
      blocked={blocked}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      amount={amountToAirdrop}
      symbol={symbol}
      preparingTransactions={merkleDistContract == null}
      actionText={<Trans>Claim {symbol}</Trans>}
      actionInProgressText={<Trans>Claiming {symbol}</Trans>}
      handleAction={claimAction}
      requiresApproval={false}
      sx={sx}
      {...props}
    />
  );
};
