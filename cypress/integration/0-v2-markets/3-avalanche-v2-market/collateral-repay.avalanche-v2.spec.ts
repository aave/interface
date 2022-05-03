import { repayCollateral } from '../../../support/steps/multi.steps';
import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { configEnvWithTenderlyAvalancheFork } from '../../../support/steps/configuration.steps';

const testData = {
  USDTCase: {
    deposit: {
      asset: assets.avalancheMarket.AVAX,
      amount: 100,
      hasApproval: true,
    },
    borrow: {
      asset: assets.avalancheMarket.USDT,
      amount: 10,
      apyType: constants.borrowAPYType.variable,
      hasApproval: true,
    },
    repay: {
      asset: assets.avalancheMarket.USDT,
      apyType: constants.apyType.variable,
      amount: 10,
      hasApproval: false,
      repayOption: constants.repayType.collateral,
    },
  },
  USDCCase: {
    deposit: {
      asset: assets.avalancheMarket.AVAX,
      amount: 100,
      hasApproval: true,
    },
    borrow: {
      asset: assets.avalancheMarket.USDC,
      amount: 10,
      apyType: constants.borrowAPYType.stable,
      hasApproval: true,
    },
    repay: {
      asset: assets.avalancheMarket.USDC,
      apyType: constants.apyType.stable,
      amount: 10,
      hasApproval: false,
      repayOption: constants.repayType.collateral,
    },
  },
};

const configEnv = () => configEnvWithTenderlyAvalancheFork({});

describe('REPAY AS COLLATERAL, AVALANCHE V2 MARKET, INTEGRATION SPEC', () => {
  repayCollateral(testData.USDCCase, configEnv);
  repayCollateral(testData.USDTCase, configEnv);
});
