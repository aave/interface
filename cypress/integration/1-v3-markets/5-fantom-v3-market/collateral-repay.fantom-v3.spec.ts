import { repayCollateral } from '../../../support/steps/multi.steps';
import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { configEnvWithTenderlyFantomFork } from '../../../support/steps/configuration.steps';

const testData = {
  USDTCase: {
    deposit: {
      asset: assets.fantomMarket.FTM,
      amount: 1000,
      hasApproval: true,
    },
    borrow: {
      asset: assets.fantomMarket.USDT,
      amount: 10,
      apyType: constants.borrowAPYType.variable,
      hasApproval: true,
    },
    repay: {
      asset: assets.fantomMarket.USDT,
      apyType: constants.apyType.variable,
      amount: 50,
      hasApproval: false,
      repayOption: constants.repayType.collateral,
    },
  },
  USDCCase: {
    deposit: {
      asset: assets.fantomMarket.FTM,
      amount: 1000,
      hasApproval: true,
    },
    borrow: {
      asset: assets.fantomMarket.USDC,
      amount: 10,
      apyType: constants.borrowAPYType.stable,
      hasApproval: true,
    },
    repay: {
      asset: assets.fantomMarket.USDC,
      apyType: constants.apyType.stable,
      amount: 50,
      hasApproval: false,
      repayOption: constants.repayType.collateral,
    },
  },
};

const configEnv = () => configEnvWithTenderlyFantomFork({ v3: true });

describe('REPAY AS COLLATERAL, FANTOM V3 MARKET, INTEGRATION SPEC', () => {
  repayCollateral(testData.USDCCase, configEnv);
  repayCollateral(testData.USDTCase, configEnv);
});
