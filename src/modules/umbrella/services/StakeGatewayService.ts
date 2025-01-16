import { gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
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
}
