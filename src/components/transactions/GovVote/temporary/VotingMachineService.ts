import { BigNumber, PopulatedTransaction, providers } from 'ethers';
import { splitSignature } from 'ethers/lib/utils';

import { VotingMachine__factory } from './typechain/factory/VotingMachine__factory';

export interface ProviderWithSend extends providers.Provider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send<P = any, R = any>(method: string, params: Array<P>): Promise<R>;
}

interface VotingBalanceProof {
  underlyingAsset: string;
  slot: string;
  proof: string;
}

export class VotingMachineService {
  private readonly _interface;

  constructor(private readonly votingMachineContractAddress: string) {
    this._interface = VotingMachine__factory.createInterface();
  }

  generateSubmitVoteTxData = async (
    user: string,
    proposalId: number,
    support: boolean,
    votingProofs: VotingBalanceProof[]
  ) => {
    const tx: PopulatedTransaction = {};
    const txData = this._interface.encodeFunctionData('submitVote', [
      proposalId,
      support,
      votingProofs,
    ]);
    tx.to = this.votingMachineContractAddress;
    tx.from = user;
    tx.data = txData;
    tx.gasLimit = BigNumber.from(1000000);
    return tx;
  };

  generateSubmitVoteBySignatureTxData = async (
    user: string,
    proposalId: number,
    support: boolean,
    votingProofs: VotingBalanceProof[],
    signature: string
  ) => {
    const { v, r, s } = splitSignature(signature);
    const tx: PopulatedTransaction = {};
    const txData = this._interface.encodeFunctionData('submitVoteBySignature', [
      proposalId,
      user,
      support,
      votingProofs,
      v,
      r,
      s,
    ]);
    tx.to = this.votingMachineContractAddress;
    tx.from = user;
    tx.data = txData;
    tx.gasLimit = BigNumber.from(1000000);
    return tx;
  };
}
