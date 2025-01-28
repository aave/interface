import { gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { SignatureLike, splitSignature } from '@ethersproject/bytes';
import { BigNumber, PopulatedTransaction } from 'ethers';

import { StakeGatewayInterface } from './types/StakeGateway';
import { StakeGateway__factory } from './types/StakeGateway__factory';

export class StakeGatewayService {
  private readonly interface: StakeGatewayInterface;

  constructor(private readonly stakeGatewayAddress: string) {
    this.interface = StakeGateway__factory.createInterface();
  }

  stake(user: string, stakeTokenAddress: string, amount: string) {
    const tx: PopulatedTransaction = {};
    const txData = this.interface.encodeFunctionData('stake', [stakeTokenAddress, amount]);
    tx.data = txData;
    tx.from = user;
    tx.to = this.stakeGatewayAddress;
    // TODO: change properly
    tx.gasLimit = BigNumber.from(gasLimitRecommendations[ProtocolAction.supply].recommended);
    return tx;
  }

  stakeWithPermit(
    user: string,
    stakeTokenAddress: string,
    amount: string,
    deadline: string,
    permit: SignatureLike
  ) {
    const tx: PopulatedTransaction = {};
    const signature = splitSignature(permit);
    const txData = this.interface.encodeFunctionData('stakeWithPermit', [
      stakeTokenAddress,
      amount,
      deadline,
      signature.v,
      signature.r,
      signature.s,
    ]);
    tx.data = txData;
    tx.from = user;
    tx.to = this.stakeGatewayAddress;
    tx.gasLimit = BigNumber.from(gasLimitRecommendations[ProtocolAction.supply].recommended);
    return tx;
  }

  stakeAToken(user: string, stakeTokenAddress: string, amount: string) {
    const tx: PopulatedTransaction = {};
    const txData = this.interface.encodeFunctionData('stakeATokens', [stakeTokenAddress, amount]);
    tx.data = txData;
    tx.from = user;
    tx.to = this.stakeGatewayAddress;
    // TODO: change properly
    tx.gasLimit = BigNumber.from(gasLimitRecommendations[ProtocolAction.supply].recommended);
    return tx;
  }

  stakeATokenWithPermit(
    user: string,
    stakeTokenAddress: string,
    amount: string,
    deadline: string,
    permit: SignatureLike
  ) {
    const tx: PopulatedTransaction = {};
    const signature = splitSignature(permit);
    const txData = this.interface.encodeFunctionData('stakeATokensWithPermit', [
      stakeTokenAddress,
      amount,
      deadline,
      signature.v,
      signature.r,
      signature.s,
    ]);
    tx.data = txData;
    tx.from = user;
    tx.to = this.stakeGatewayAddress;
    tx.gasLimit = BigNumber.from(gasLimitRecommendations[ProtocolAction.supply].recommended);
    return tx;
  }

  redeem(user: string, stakeTokenAddress: string, amount: string) {
    const txData = this.interface.encodeFunctionData('redeem', [stakeTokenAddress, amount]);
    return {
      data: txData,
      from: user,
      to: this.stakeGatewayAddress,
      gasLimit: BigNumber.from(gasLimitRecommendations[ProtocolAction.supply].recommended),
    };
  }

  redeemATokens(user: string, stakeTokenAddress: string, amount: string) {
    const txData = this.interface.encodeFunctionData('redeemATokens', [stakeTokenAddress, amount]);
    return {
      data: txData,
      from: user,
      to: this.stakeGatewayAddress,
      gasLimit: BigNumber.from(gasLimitRecommendations[ProtocolAction.supply].recommended),
    };
  }
}
