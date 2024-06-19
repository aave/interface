import { Provider } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

// export interface TokenDelegationPower {
//   address: string;
//   votingPower: FixedPointDecimal;
//   propositionPower: FixedPointDecimal;
// }

export class TokensNativeYieldService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  // private getDelegationTokenService(tokenAddress: string, chainId: number) {
  //   const provider = this.getProvider(chainId);
  //   return new AaveTokenV3Service(tokenAddress, provider);
  // }

  // async getTokenPowers(
  //   user: string,
  //   token: string,
  //   chainId: number
  // ): Promise<TokenDelegationPower> {
  //   const service = this.getDelegationTokenService(token, chainId);
  //   const result = await service.getPowers(user);
  //   return {
  //     address: token,
  //     votingPower: new FixedPointDecimal(result.votingPower, 18),
  //     propositionPower: new FixedPointDecimal(result.propositionPower, 18),
  //   };
  // }

  async getTokensNativeYield(chainId: number) {
    return this.getWSTETHNativeYield(chainId);
  }

  getWSTETHNativeYield = async (chainId: number) => {
    // type TokenRebasedEvent = {
    //   reportTimestamp: BigNumber;
    //   timeElapsed: BigNumber;
    //   preTotalEther: BigNumber;
    //   preTotalShares: BigNumber;
    //   postTotalEther: BigNumber;
    //   postTotalShares: BigNumber;
    //   sharesMintedAsFees: BigNumber;
    // };
    const computeStEthAPR = (
      preTotalEther: BigNumber,
      preTotalShares: BigNumber,
      postTotalEther: BigNumber,
      postTotalShares: BigNumber,
      timeElapsed: BigNumber
    ) => {
      // console.log('preTotalEther', preTotalEther.toString());
      // console.log('preTotalShares', preTotalShares.toString());
      const eighteenDecimals = BigNumber.from(10).pow(18);
      const secondsInYear = BigNumber.from(60 * 60 * 24 * 365);
      const preShareRate = preTotalEther.mul(BigNumber.from(10).pow(27)).div(preTotalShares);
      const postShareRate = postTotalEther.mul(BigNumber.from(10).pow(27)).div(postTotalShares);
      console.log('preShareRate', preShareRate.toString());
      console.log('postShareRate', postShareRate.toString());
      console.log('test', postShareRate.sub(preShareRate).div(preShareRate).toString());
      console.log('test2', postShareRate.sub(preShareRate).toString());
      console.log(
        'test3',
        postShareRate.sub(preShareRate).mul(BigNumber.from(10).pow(18)).toString()
      );
      console.log(
        'test35',
        secondsInYear
          .mul(postShareRate.sub(preShareRate).mul(BigNumber.from(10).pow(18)))
          .div(timeElapsed)
          .toString()
      );
      console.log(
        'test36',
        secondsInYear
          .mul(postShareRate.sub(preShareRate).mul(BigNumber.from(10).pow(18)))
          .div(timeElapsed)
          .div(BigNumber.from(10).pow(18))
          .toString()
      );
      // console.log(
      //   'test3',
      //   postShareRate
      //     .sub(preShareRate)
      //     .mul(10 ** 18)
      //     .div(preShareRate)
      //     .toString()
      // );
      // console.log('test3', postShareRate.sub(preShareRate).toNumber());
      // console.log('test3', postShareRate.sub(preShareRate).toNumber() * 1000);
      console.log(
        'test4',
        BigNumber.from('111985298517642957633010')
          .mul(10 ** 10)
          .div(BigNumber.from('1168819034657415652473133'))
      );
      console.log('test5');

      // * 10 ** 18 because otherwise the division will be 0
      const pendingUserApr = secondsInYear
        .mul(postShareRate.sub(preShareRate).mul(eighteenDecimals).div(preShareRate))
        .div(timeElapsed);

      const userApr = formatUnits(pendingUserApr, 18);
      const userAprFormated = Number(userApr) * 100;

      console.log('pendingUserApr', pendingUserApr.toString());
      console.log('userApr', pendingUserApr.toString());
      console.log('userAprFormated', userAprFormated.toString());
      return userAprFormated;
    };
    const abi = [
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: 'reportTimestamp', type: 'uint256' },
          { indexed: false, name: 'timeElapsed', type: 'uint256' },
          { indexed: false, name: 'preTotalShares', type: 'uint256' },
          { indexed: false, name: 'preTotalEther', type: 'uint256' },
          { indexed: false, name: 'postTotalShares', type: 'uint256' },
          { indexed: false, name: 'postTotalEther', type: 'uint256' },
          { indexed: false, name: 'sharesMintedAsFees', type: 'uint256' },
        ],
        name: 'TokenRebased',
        type: 'event',
      },
    ];

    const provider = this.getProvider(chainId);
    const contract = new Contract('0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', abi);
    const connectedContract = contract.connect(provider);
    const currentBlockNumber = await provider.getBlockNumber();
    const daysInSeconds = 60 * 60 * 24 * 7;
    const blocksInDays = daysInSeconds / 12;
    const events = await connectedContract.queryFilter(
      connectedContract.filters.TokenRebased(),
      currentBlockNumber - blocksInDays * 2, // 1 week
      currentBlockNumber
    );
    const event = events[events.length - 1].args;
    if (!event) return null;
    console.log('event', event);
    // const preTotalEther = event['preTotalEther'];
    // const preTotalShares = event['preTotalShares'];
    // const postTotalEther = event['postTotalEther'];
    // const postTotalShares = event['postTotalShares'];
    // const timeElapsed = event['timeElapsed'];
    const apr = computeStEthAPR(
      event['preTotalEther'],
      event['preTotalShares'],
      event['postTotalEther'],
      event['postTotalShares'],
      event['timeElapsed']
    );
    console.log('apr', apr.toString());
    return null;
    // return connectedContract(addresses) as Promise<string[]>;
  };
}
