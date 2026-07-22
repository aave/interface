import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { AbiCoder, keccak256, RLP } from 'ethers/lib/utils';
import { useGovernanceTokensAndPowers } from 'src/hooks/governance/useGovernanceTokensAndPowers';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { VoteProposalData } from 'src/modules/governance/types';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { pollVoteStatus, RelayError, submitRelayVote } from './temporary/voteRelayClient';
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
  proposal: VoteProposalData;
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
  const { mainTxState, loadingTxns, setMainTxState, setTxError } = useModalContext();
  const user = useRootStore((store) => store.account);

  const estimateGasLimit = useRootStore((store) => store.estimateGasLimit);
  const { sendTx, signTxData } = useWeb3Context();
  const queryClient = useQueryClient();

  const tokenPowers = useGovernanceTokensAndPowers(proposal.snapshotBlockHash);
  const proposalId = +proposal.proposalId;
  const blockHash = proposal.snapshotBlockHash;
  const votingChainId = proposal.votingMachineChainId;
  const votingMachineAddress =
    governanceV3Config.votingChainConfig[votingChainId].votingMachineAddress;

  const withGaslessVoting = process.env.NEXT_PUBLIC_ENABLE_GASLESS_VOTING === 'true';

  const assets: Array<{ underlyingAsset: string; isWithDelegatedPower: boolean }> = [];

  if (tokenPowers && tokenPowers.aAaveTokenPower.votingPower.toString() !== '0') {
    assets.push({
      underlyingAsset: governanceV3Config.votingAssets.aAaveTokenAddress,
      isWithDelegatedPower: tokenPowers.isAAaveTokenWithDelegatedPower || false,
    });
  }

  if (tokenPowers && tokenPowers.stkAaveTokenPower.votingPower.toString() !== '0') {
    assets.push({
      underlyingAsset: governanceV3Config.votingAssets.stkAaveTokenAddress,
      isWithDelegatedPower: tokenPowers.isStkAaveTokenWithDelegatedPower || false,
    });
  }

  if (tokenPowers && tokenPowers.aaveTokenPower.votingPower.toString() !== '0') {
    assets.push({
      underlyingAsset: governanceV3Config.votingAssets.aaveTokenAddress,
      isWithDelegatedPower: tokenPowers.isAaveTokenWithDelegatedPower || false,
    });
  }

  // Self-paid vote: the connected wallet sends `submitVote` and pays gas. Also the
  // fallback when the sponsored relay is unavailable.
  const submitSelfPaidVote = async (proofs: Awaited<ReturnType<typeof getVotingBalanceProofs>>) => {
    const votingMachineService = new VotingMachineService(votingMachineAddress);
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

    queryClient.invalidateQueries({ queryKey: queryKeysFactory.governanceCache });
  };

  const action = async () => {
    setMainTxState({ ...mainTxState, loading: true });
    try {
      const proofs = await getVotingBalanceProofs(user, assets, ChainId.mainnet, blockHash);

      if (withGaslessVoting) {
        try {
          // Sign over the assets + slots only; the proof bytes are sent but not signed.
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

          // The relay encodes `submitVoteBySignature` itself — send raw proofs + signature.
          const accepted = await submitRelayVote({
            chainId: votingChainId,
            proposalId,
            voter: user,
            support,
            votingBalanceProofs: proofs,
            signature: signature.toString(),
          });

          const txHash = await pollVoteStatus(accepted.transactionId, accepted.transactionHash);

          setMainTxState({
            txHash,
            loading: false,
            success: true,
          });

          queryClient.invalidateQueries({ queryKey: queryKeysFactory.governanceCache });
          return;
        } catch (err) {
          // Relayer temporarily down — fall back to a self-paid vote. Any other relay
          // error (bad signature, already voted, simulation reverted, vote in flight)
          // is surfaced to the user rather than silently retried.
          if (!(err instanceof RelayError && err.code === 'RELAYER_UNAVAILABLE')) {
            throw err;
          }
        }
      }

      await submitSelfPaidVote(proofs);
    } catch (err) {
      setTxError(getErrorTextFromError(err as Error, TxAction.MAIN_ACTION, false));
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
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
