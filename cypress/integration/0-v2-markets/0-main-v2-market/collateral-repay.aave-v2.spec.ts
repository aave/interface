import { repayCollateral } from '../../../support/steps/multi.steps';
import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { configEnvWithTenderlyMainnetFork } from '../../../support/steps/configuration.steps';

const testData = {
  USDTCase: {
    deposit: {
      asset: assets.aaveMarket.ETH,
      amount: 100,
      hasApproval: true,
    },
    borrow: {
      asset: assets.aaveMarket.USDT,
      amount: 10,
      apyType: constants.borrowAPYType.variable,
      hasApproval: true,
    },
    repay: {
      asset: assets.aaveMarket.USDT,
      apyType: constants.apyType.variable,
      amount: 10,
      hasApproval: false,
      repayOption: constants.repayType.collateral,
    },
  },
  USDCCase: {
    deposit: {
      asset: assets.aaveMarket.ETH,
      amount: 100,
      hasApproval: true,
    },
    borrow: {
      asset: assets.aaveMarket.USDC,
      amount: 10,
      apyType: constants.borrowAPYType.stable,
      hasApproval: true,
    },
    repay: {
      asset: assets.aaveMarket.USDC,
      apyType: constants.apyType.stable,
      amount: 10,
      hasApproval: false,
      repayOption: constants.repayType.collateral,
    },
  },
};

const configEnv = () => configEnvWithTenderlyMainnetFork({});

describe('REPAY AS COLLATERAL, AAVE V2 MARKET, INTEGRATION SPEC', () => {
  repayCollateral(testData.USDCCase, configEnv);
  repayCollateral(testData.USDTCase, configEnv);
});
