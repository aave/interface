import { Trans } from '@lingui/macro';
import { EnhancedProposal } from 'src/hooks/governance/useProposal';
import { useModalContext } from 'src/hooks/useModal';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { useRootStore } from 'src/store/root';
import { VotingMachineService } from './temporary/VotingMachineService';
import { governanceConfig, governanceV3Config } from 'src/ui-config/governanceConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { ChainId } from '@aave/contract-helpers';
import { AbiCoder, RLP, keccak256, solidityKeccak256 } from 'ethers/lib/utils';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { BigNumber, constants } from 'ethers';

interface GetProofResponse {
  balance: string,
  codeHash: string,
  nonce: string,
  storageHash: string,
  accountProof: string[],
  storageProof: Array<{
    key: string,
    value: string,
    proof: string[]
  }>
}

export type GovVoteActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  proposal: EnhancedProposal;
  support: boolean;
};

export const GovVoteActions = ({
  isWrongNetwork,
  blocked,
  proposal,
  support,
}: GovVoteActionsProps) => {
  const { mainTxState, loadingTxns } = useModalContext();
  const user = useRootStore(store => store.account);
  const estimateGasLimit = useRootStore(store => store.estimateGasLimit)
  const { sendTx } = useWeb3Context();
  const proposalId = proposal.proposal.proposalId;
  const assets = proposal.votingMachineData.votingAssets;
  const blockHash = proposal.proposalData.proposalData.snapshotBlockHash

  const action = async () => {
    const coreProvider = getProvider(ChainId.sepolia);
    const votingProvider = getProvider(ChainId.fuji);
    const abiCoder = new AbiCoder()
    const votingPowerSlot = keccak256(abiCoder.encode(["address", "uint256"], [user, 0]));
    const proofs = await Promise.all(assets.map(asset => coreProvider.send<any, GetProofResponse>("eth_getProof", [
      asset,
      [votingPowerSlot],
      blockHash
    ]).then(rawProof => {
      const asd = BigNumber.from(rawProof.storageProof[0].key).gt(constants.MaxUint256)
      console.log(asd)
      return {
        underlyingAsset: asset,
        slot: '0',
        proof: RLP.encode(rawProof.storageProof[0].proof.map(elem => RLP.decode(elem)))
      }
    })))
    const votingMachineService = new VotingMachineService(governanceV3Config.votingChainConfig[43113].votingMachineAddress, votingProvider);
    const tx = await votingMachineService.generateSubmitVoteTxData(user, +proposalId, support, proofs);
    // const txWithEstimatedGas = await estimateGasLimit(tx, ChainId.fuji)
    sendTx(tx)

  };

  return (
    <TxActionsWrapper
      requiresApproval={false}
      blocked={blocked}
      mainTxState={mainTxState}
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={support ? <Trans>VOTE YAE</Trans> : <Trans>VOTE NAY</Trans>}
      actionInProgressText={support ? <Trans>VOTE YAE</Trans> : <Trans>VOTE NAY</Trans>}
      isWrongNetwork={isWrongNetwork}
    />
  );
};
