import { ChainId } from '@aave/contract-helpers';
import { GelatoRelay } from '@gelatonetwork/relay-sdk';
import { Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { AbiCoder, keccak256, RLP } from 'ethers/lib/utils';
import { useState } from 'react';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { useGovernanceTokensAndPowers } from 'src/hooks/governance/useGovernanceTokensAndPowers';
import { Proposal } from 'src/hooks/governance/useProposals';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { VotingMachineService } from './temporary/VotingMachineService';

export const baseSlots = {
  [governanceV3Config.votingAssets.stkAaveTokenAddress.toLowerCase()]: {
    balance: 0,
    exchangeRate: 81,
  },
  [governanceV3Config.votingAssets.aAaveTokenAddress.toLowerCase()]: {
    balance: 52,
    delegation: 64,
  },
  [governanceV3Config.votingAssets.aaveTokenAddress.toLowerCase()]: {
    balance: 0,
  },
};

interface GetProofResponse {
  balance: string;
  codeHash: string;
  nonce: string;
  storageHash: string;
  accountProof: string[];
  storageProof: Array<{
    key: string;
    value: string;
    proof: string[];
  }>;
}

export type AssetsBalanceSlots = Record<
  string,
  {
    balance: number;
    delegation?: number;
    exchangeRate?: number;
  }
>;

export type GovVoteActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  proposal: Proposal;
  support: boolean;
};

interface VotingAssetWithSlot {
  underlyingAsset: string;
  slot: number;
}

const generateSubmitVoteSignature = (
  votingChainId: number,
  votingMachineAddress: string,
  proposalId: number,
  voter: string,
  support: boolean,
  votingAssetsWithSlot: VotingAssetWithSlot[]
) => {
  const typedData = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      VotingAssetWithSlot: [
        { name: 'underlyingAsset', type: 'address' },
        { name: 'slot', type: 'uint128' },
      ],
      SubmitVote: [
        {
          name: 'proposalId',
          type: 'uint256',
        },
        {
          name: 'voter',
          type: 'address',
        },
        {
          name: 'support',
          type: 'bool',
        },
        {
          name: 'votingAssetsWithSlot',
          type: 'VotingAssetWithSlot[]',
        },
      ],
    },
    primaryType: 'SubmitVote',
    domain: {
      name: 'Aave Voting Machine',
      version: 'V1',
      chainId: votingChainId,
      verifyingContract: votingMachineAddress,
    },
    message: {
      proposalId,
      voter,
      support,
      votingAssetsWithSlot,
    },
  };
  return JSON.stringify(typedData);
};

export const assetsBalanceSlots = {
  [governanceV3Config.votingAssets.stkAaveTokenAddress.toLowerCase()]: {
    ...baseSlots[governanceV3Config.votingAssets.stkAaveTokenAddress.toLowerCase()],
  },
  [governanceV3Config.votingAssets.aAaveTokenAddress.toLowerCase()]: {
    ...baseSlots[governanceV3Config.votingAssets.aAaveTokenAddress.toLowerCase()],
  },
  [governanceV3Config.votingAssets.aaveTokenAddress.toLowerCase()]: {
    ...baseSlots[governanceV3Config.votingAssets.aaveTokenAddress.toLowerCase()],
  },
};

const getVoteBalanceSlot = (
  underlyingAsset: string,
  isWithDelegatedPower: boolean,
  aAaveAddress: string,
  slots: AssetsBalanceSlots
) => {
  return underlyingAsset.toLowerCase() === aAaveAddress.toLowerCase() && isWithDelegatedPower
    ? slots[underlyingAsset.toLowerCase()].delegation || 64
    : slots[underlyingAsset.toLowerCase()].balance || 0;
};

const getVotingBalanceProofs = (
  user: string,
  assets: Array<{ underlyingAsset: string; isWithDelegatedPower: boolean }>,
  chainId: ChainId,
  blockHash: string
) => {
  const provider = getProvider(chainId);
  const abiCoder = new AbiCoder();

  return Promise.all(
    assets.map((asset) => {
      const baseVotingSlot = getVoteBalanceSlot(
        asset.underlyingAsset,
        asset.isWithDelegatedPower,
        governanceV3Config.votingAssets.aAaveTokenAddress,
        assetsBalanceSlots
      );
      const votingPowerSlot = keccak256(
        abiCoder.encode(['address', 'uint256'], [user, baseVotingSlot])
      );

      return provider
        .send<unknown, GetProofResponse>('eth_getProof', [
          asset.underlyingAsset,
          [votingPowerSlot],
          blockHash,
        ])
        .then((rawProof) => {
          return {
            underlyingAsset: asset.underlyingAsset,
            slot: `${baseVotingSlot}`,
            proof: RLP.encode(rawProof.storageProof[0].proof.map((elem) => RLP.decode(elem))),
          };
        });
    })
  );
};

export const GovVoteActions = ({
  isWrongNetwork,
  blocked,
  proposal,
  support,
}: GovVoteActionsProps) => {
  const {
    mainTxState,
    loadingTxns,
    setMainTxState,
    setApprovalTxState,
    approvalTxState,
    setTxError,
  } = useModalContext();
  const user = useRootStore((store) => store.account);

  const estimateGasLimit = useRootStore((store) => store.estimateGasLimit);
  const { sendTx, signTxData } = useWeb3Context();
  const queryClient = useQueryClient();
  const tokenPowers = useGovernanceTokensAndPowers(proposal.subgraphProposal.snapshotBlockHash);
  const [signature, setSignature] = useState<string | undefined>(undefined);
  const proposalId = +proposal.subgraphProposal.id;
  const blockHash = proposal.subgraphProposal.snapshotBlockHash;
  const votingChainId = +proposal.subgraphProposal.votingPortal.votingMachineChainId;
  const votingMachineAddress =
    governanceV3Config.votingChainConfig[votingChainId].votingMachineAddress;

  const withGelatoRelayer = false;

  const assets: Array<{ underlyingAsset: string; isWithDelegatedPower: boolean }> = [];

  if (tokenPowers?.aAave !== '0') {
    assets.push({
      underlyingAsset: governanceV3Config.votingAssets.aAaveTokenAddress,
      isWithDelegatedPower: tokenPowers?.isAAaveTokenWithDelegatedPower || false,
    });
  }
  if (tokenPowers?.stkAave !== '0') {
    assets.push({
      underlyingAsset: governanceV3Config.votingAssets.stkAaveTokenAddress,
      isWithDelegatedPower: tokenPowers?.isStkAaveTokenWithDelegatedPower || false,
    });
  }
  if (tokenPowers?.aave !== '0') {
    assets.push({
      underlyingAsset: governanceV3Config.votingAssets.aaveTokenAddress,
      isWithDelegatedPower: tokenPowers?.isAaveTokenWithDelegatedPower || false,
    });
  }

  const action = async () => {
    setMainTxState({ ...mainTxState, loading: true });
    try {
      const proofs = await getVotingBalanceProofs(user, assets, ChainId.mainnet, blockHash);

      const votingMachineService = new VotingMachineService(votingMachineAddress);

      if (withGelatoRelayer && signature) {
        const tx = await votingMachineService.generateSubmitVoteBySignatureTxData(
          user,
          proposalId,
          support,
          proofs,
          signature.toString()
        );

        const gelatoRelay = new GelatoRelay();
        const gelatoRequest = {
          chainId: BigInt(votingChainId),
          target: votingMachineAddress,
          data: tx.data || '',
        };

        const response = await gelatoRelay.sponsoredCall(gelatoRequest, '');
        setTimeout(async function checkForStatus() {
          const status = await gelatoRelay.getTaskStatus(response.taskId);
          if (status?.blockNumber && status.transactionHash) {
            setMainTxState({
              txHash: status.transactionHash,
              loading: false,
              success: true,
            });
            queryClient.invalidateQueries({ queryKey: ['governance_proposal', proposalId, user] });
            return;
          } else {
            setTimeout(checkForStatus, 5000);
            return;
          }
        }, 5000);
      } else {
        const tx = await votingMachineService.generateSubmitVoteTxData(
          user,
          proposalId,
          support,
          proofs
        );

        const txWithEstimatedGas = await estimateGasLimit(tx, votingChainId);

        const response = await sendTx(txWithEstimatedGas);
        await response.wait(1);
        setMainTxState({
          txHash: response.hash,
          loading: false,
          success: true,
        });

        queryClient.invalidateQueries({ queryKey: ['governance_proposal', proposalId, user] });
      }
    } catch (err) {
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  const approve = async () => {
    try {
      setApprovalTxState({ ...approvalTxState, loading: true });
      const toSign = generateSubmitVoteSignature(
        votingChainId,
        votingMachineAddress,
        proposalId,
        user,
        support,
        assets.map((elem) => ({
          underlyingAsset: elem.underlyingAsset,
          slot: getVoteBalanceSlot(
            elem.underlyingAsset,
            elem.isWithDelegatedPower,

            governanceV3Config.votingAssets.aAaveTokenAddress,
            assetsBalanceSlots
          ),
        }))
      );
      const signature = await signTxData(toSign);
      setSignature(signature.toString());
      setTxError(undefined);
      setApprovalTxState({
        txHash: MOCK_SIGNED_HASH,
        loading: false,
        success: true,
      });
    } catch {}
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
      handleApproval={approve}
    />
  );
};
