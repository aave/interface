import { IRewardsDistributor__factory } from "./types/IRewardsDistributor__factory";
import { IRewardsDistributorInterface } from "./types/IRewardsDistributor";
import { BigNumber, PopulatedTransaction } from "ethers";
import { gasLimitRecommendations, ProtocolAction } from "@aave/contract-helpers";

export class RewardsDistributorService {
  private readonly interface: IRewardsDistributorInterface;

  constructor(private readonly rewardsDistributorAddress: string) {
    this.interface = IRewardsDistributor__factory.createInterface();
  }

  claimAllRewards(user: string, stakeToken: string) {
    const tx: PopulatedTransaction = {};
    const txData = this.interface.encodeFunctionData('claimAllRewards', [
      stakeToken,
      user,
    ]);
    tx.data = txData;
    tx.from = user;
    tx.to = this.rewardsDistributorAddress;
    // TODO: change properly
    tx.gasLimit = BigNumber.from(gasLimitRecommendations[ProtocolAction.supply].recommended);
    return tx;
  }

  claimSelectedRewards(user: string, stakeToken: string, rewards: string[]) {
    const tx: PopulatedTransaction = {};
    const txData = this.interface.encodeFunctionData('claimSelectedRewards', [
      stakeToken,
      rewards,
      user,
    ]);
    tx.data = txData;
    tx.from = user;
    tx.to = this.rewardsDistributorAddress;
    return tx;
  }
}