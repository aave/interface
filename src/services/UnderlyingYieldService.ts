import { Provider } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

export interface UnderlyingAPYs {
  [key: string]: number | null;
}

const DAY_IN_SECONDS = 60 * 60 * 24;
const YEAR_IN_SECONDS = 365 * DAY_IN_SECONDS;

const BLOCKS_A_DAY = DAY_IN_SECONDS / 12; // assume 12s block time

const RAY_PRECISION = 27;
// const RAY = BigNumber.from(10).pow(RAY_PRECISION);
const WAD_PRECISION = 18;
const WAD = BigNumber.from(10).pow(WAD_PRECISION);

const aprToApy = (apr: number, compund: number) => {
  return (1 + apr / compund) ** compund - 1;
};

type LstExchangeData = {
  ethSupply: number;
  lstSupply: number;
  timestamp: number;
};

export class UnderlyingYieldService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  async getUnderlyingAPYs(): Promise<UnderlyingAPYs> {
    const provider = this.getProvider(1);
    const currentBlockNumber = await provider.getBlockNumber();

    const stethAPY = await this.getStethAPY(provider, currentBlockNumber);
    const sdaiAPY = await this.getSdaiAPY(provider);
    const rethAPY = await this.getRethAPY(provider, currentBlockNumber);
    const ethxAPY = await this.getEthxAPY(provider, currentBlockNumber);
    console.log('ethxAPY', ethxAPY);
    return {
      wstETH: stethAPY,
      sDAI: sdaiAPY,
      rETH: rethAPY,
      ETHx: ethxAPY,
    };
  }

  getStethAPY = async (provider: Provider, currentBlockNumber: number) => {
    // computation formula: https://docs.lido.fi/integrations/api#last-lido-apr-for-steth
    const computeStethAPY = ({
      preTotalEther,
      preTotalShares,
      postTotalEther,
      postTotalShares,
      timeElapsed,
    }: {
      preTotalEther: BigNumber;
      preTotalShares: BigNumber;
      postTotalEther: BigNumber;
      postTotalShares: BigNumber;
      timeElapsed: BigNumber;
    }) => {
      const secondsInYear = BigNumber.from(YEAR_IN_SECONDS);

      const preShareRate = preTotalEther.mul(BigNumber.from(10).pow(27)).div(preTotalShares);
      const postShareRate = postTotalEther.mul(BigNumber.from(10).pow(27)).div(postTotalShares);

      // need to mul by 10e18 because otherwise the division will be 0 (since the result is less than 1)
      const pendingApr = secondsInYear
        .mul(postShareRate.sub(preShareRate).mul(WAD).div(preShareRate))
        .div(timeElapsed);

      // then format to 18 decimals
      const apr = formatUnits(pendingApr, WAD_PRECISION);

      // stEth rebased daily: https://help.lido.fi/en/articles/5230610-what-is-steth
      const apy = aprToApy(Number(apr), 365);

      return apy;
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

    const contract = new Contract('0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', abi); // stETH token
    const connectedContract = contract.connect(provider);

    const blocksInDay = DAY_IN_SECONDS / 12;

    const events = await connectedContract.queryFilter(
      connectedContract.filters.TokenRebased(),
      currentBlockNumber - blocksInDay * 7, // ~1 week
      currentBlockNumber
    );

    const latestEvent = events.length === 0 ? null : events[events.length - 1];

    if (!latestEvent || !latestEvent.args) {
      // in case there are no events in the last week
      const res = await fetch('https://eth-api.lido.fi/v1/protocol/steth/apr/last');
      const resParsed: {
        data: {
          timeUnix: number;
          apr: number;
        };
        meta: {
          symbol: string;
          address: string;
          chainId: number;
        };
      } = await res.json();
      // data.apr is the apy
      return resParsed.data.apr;
    } else {
      return computeStethAPY({
        preTotalEther: latestEvent.args['preTotalEther'],
        preTotalShares: latestEvent.args['preTotalShares'],
        postTotalEther: latestEvent.args['postTotalEther'],
        postTotalShares: latestEvent.args['postTotalShares'],
        timeElapsed: latestEvent.args['timeElapsed'],
      });
    }
  };

  getSdaiAPY = async (provider: Provider) => {
    const abi = [
      {
        constant: true,
        inputs: [],
        name: 'dsr',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      },
    ];

    const contract = new Contract('0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7', abi); // Maker DSR Pot (MCD Pot)
    const connectedContract = contract.connect(provider);

    const dsr = await connectedContract.dsr();

    const dsrFormated = formatUnits(dsr, RAY_PRECISION);

    // Inspired from DeFi LLama yield server: https://github.com/DefiLlama/yield-server/blob/master/src/adaptors/makerdao/index.js
    const apy = Number(dsrFormated) ** YEAR_IN_SECONDS - 1;

    return apy;
  };

  _getApyFromPreviousRates = (
    latestExchange: LstExchangeData,
    previousExchange: LstExchangeData,
    compound: number
  ) => {
    const latestRate = latestExchange.ethSupply / latestExchange.lstSupply;
    const previousRate = previousExchange.ethSupply / previousExchange.lstSupply;

    const ratio = latestRate / previousRate - 1; // -1 to only get the increase

    const timeBetweenExchanges = latestExchange.timestamp - previousExchange.timestamp;

    // cross product
    const apr = (ratio * YEAR_IN_SECONDS) / timeBetweenExchanges;

    const apy = aprToApy(Number(apr), compound);

    return apy;
  };

  getRethAPY = async (provider: Provider, currentBlockNumber: number) => {
    const abi = [
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: 'uint256', name: 'block', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'slotTimestamp', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'totalEth', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'stakingEth', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'rethSupply', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'blockTimestamp', type: 'uint256' },
        ],
        name: 'BalancesUpdated',
        type: 'event',
      },
    ];

    const contract = new Contract('0x6Cc65bF618F55ce2433f9D8d827Fc44117D81399', abi); // RocketNetworkBalances
    const connectedContract = contract.connect(provider);

    const events = await connectedContract.queryFilter(
      connectedContract.filters.BalancesUpdated(),
      currentBlockNumber - BLOCKS_A_DAY * 7, // 1 week - rewards are distributed approximately every 24 hours: (source: https://docs.rocketpool.net/guides/staking/overview#the-reth-token)
      currentBlockNumber
    );

    if (events.length < 2) {
      // based on 7 day average
      const res = await fetch('https://api.rocketpool.net/api/apr');
      const resParsed: {
        yearlyAPR: string;
      } = await res.json();
      return Number(resParsed.yearlyAPR) / 100;
    } else {
      const eventFormated: LstExchangeData[] = events
        .map((event) => {
          if (!event.args) return null;
          return {
            ethSupply: Number(event.args['totalEth']),
            lstSupply: Number(event.args['rethSupply']),
            timestamp: Number(event.args['blockTimestamp']),
          };
        })
        .filter((event) => event !== null) as LstExchangeData[];

      const apy = this._getApyFromPreviousRates(
        eventFormated[eventFormated.length - 1],
        eventFormated[0],
        365
      );

      return apy;
    }
  };

  getEthxAPY = async (provider: Provider, currentBlockNumber: number) => {
    const abi = [
      {
        anonymous: false,
        inputs: [
          { indexed: false, internalType: 'uint256', name: 'block', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'totalEth', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'ethxSupply', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'time', type: 'uint256' },
        ],
        name: 'ExchangeRateUpdated',
        type: 'event',
      },
    ];

    const contract = new Contract('0xF64bAe65f6f2a5277571143A24FaaFDFC0C2a737', abi); // Stader Labs Oracle
    const connectedContract = contract.connect(provider);

    const events = await connectedContract.queryFilter(
      connectedContract.filters.ExchangeRateUpdated(),
      currentBlockNumber - BLOCKS_A_DAY * 7, // 1 week
      currentBlockNumber
    );

    const eventFormated: LstExchangeData[] = events
      .map((event) => {
        if (!event.args) return null;
        return {
          ethSupply: Number(event.args['totalEth']),
          lstSupply: Number(event.args['ethxSupply']),
          timestamp: Number(event.args['time']),
        };
      })
      .filter((event) => event !== null) as LstExchangeData[];

    if (events.length < 2) {
      const res = await fetch('https://universe.staderlabs.com/eth/apy');
      const resParsed: {
        value: number;
      } = await res.json();
      return resParsed.value / 100;
    } else {
      const apy = this._getApyFromPreviousRates(
        eventFormated[eventFormated.length - 1],
        eventFormated[0],
        365
      );
      return apy;
    }
  };
}
