import { SignatureLike, splitSignature } from '@ethersproject/bytes';
import { BigNumber, PopulatedTransaction } from 'ethers';

import { IERC4626StakeTokenInterface } from './types/StakeToken';
import { IERC4626StakeToken__factory } from './types/StakeToken__factory';

export class StakeTokenService {
  private readonly interface: IERC4626StakeTokenInterface;

  constructor(private readonly stakeTokenAddress: string) {
    this.interface = IERC4626StakeToken__factory.createInterface();
  }

  cooldown(user: string) {
    const tx: PopulatedTransaction = {};
    const txData = this.interface.encodeFunctionData('cooldown');
    tx.data = txData;
    tx.from = user;
    tx.to = this.stakeTokenAddress;
    tx.gasLimit = BigNumber.from('1000000'); // TODO
    return tx;
  }

  stake(user: string, amount: string) {
    const tx: PopulatedTransaction = {};
    const txData = this.interface.encodeFunctionData('deposit', [amount, user]);
    tx.data = txData;
    tx.from = user;
    tx.to = this.stakeTokenAddress;
    tx.gasLimit = BigNumber.from('1000000'); // TODO
    return tx;
  }

  stakeWithPermit(user: string, amount: string, deadline: string, permit: SignatureLike) {
    const tx: PopulatedTransaction = {};
    const signature = splitSignature(permit);
    const txData = this.interface.encodeFunctionData('depositWithPermit', [
      user,
      amount,
      deadline,
      { v: signature.v, r: signature.r, s: signature.s },
    ]);
    tx.data = txData;
    tx.from = user;
    tx.to = this.stakeTokenAddress;
    tx.gasLimit = BigNumber.from('1000000'); // TODO
    return tx;
  }

  redeem(user: string, amount: string) {
    const tx: PopulatedTransaction = {};
    const txData = this.interface.encodeFunctionData('redeem', [amount, user, user]);
    tx.data = txData;
    tx.from = user;
    tx.to = this.stakeTokenAddress;
    tx.gasLimit = BigNumber.from('1000000'); // TODO
    return tx;
  }
}
