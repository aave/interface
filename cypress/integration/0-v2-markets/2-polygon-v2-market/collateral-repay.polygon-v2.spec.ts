import { repayCollateral } from '../../../support/steps/multi.steps';
import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { configEnvWithTenderlyPolygonFork } from '../../../support/steps/configuration.steps';

const testData = {
  USDTCase: {
    deposit: {
      asset: assets.polygonMarket.MATIC,
      amount: 100,
      hasApproval: true,
    },
    borrow: {
      asset: assets.polygonMarket.USDT,
      amount: 10,
      apyType: constants.borrowAPYType.default,
      hasApproval: true,
    },
    repay: {
      asset: assets.polygonMarket.USDT,
      apyType: constants.apyType.variable,
      amount: 10,
      hasApproval: false,
      repayOption: constants.repayType.collateral,
    },
  },
  USDCCase: {
    deposit: {
      asset: assets.polygonMarket.MATIC,
      amount: 100,
      hasApproval: true,
    },
    borrow: {
      asset: assets.polygonMarket.USDC,
      amount: 10,
      apyType: constants.borrowAPYType.default,
      hasApproval: true,
    },
    repay: {
      asset: assets.polygonMarket.USDC,
      apyType: constants.apyType.variable,
      amount: 10,
      hasApproval: false,
      repayOption: constants.repayType.collateral,
    },
  },
};

const configEnv = () => configEnvWithTenderlyPolygonFork({});

describe('REPAY AS COLLATERAL, POLYGON V2 MARKET, INTEGRATION SPEC', () => {
  repayCollateral(testData.USDCCase, configEnv);
  repayCollateral(testData.USDTCase, configEnv);
});
