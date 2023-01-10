import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { DashboardActions } from '../../../support/actions/dashboard.actions';
import { TenderlyActions } from '../../../support/actions/tenderly.actions';
import { DashboardHelpers } from '../../../support/helpers/dashboard.helper';
import { configEnvWithTenderlyGoerliGhoFork } from '../../../support/steps/configuration.steps';
import gho from './fixtures/gho.json';
import { tokenSet } from './helpers/token.helper';

const testData = {
  borrow: {
    asset: assets.ghoV3Market.GHO,
    amount: 100,
    apyType: constants.borrowAPYType.default,
    hasApproval: true,
  },
  borrow2: {
    asset: assets.ghoV3Market.GHO,
    amount: 1000,
    apyType: constants.borrowAPYType.default,
    hasApproval: true,
  },
};

describe(`GHO discount integrating testing`, () => {
  let baseApy: number;

  describe(`Verify default APY for GHO`, () => {
    configEnvWithTenderlyGoerliGhoFork({
      v3: true,
    });
    it(`Check APY rate from dashboard is ${gho.apy.max}%`, () => {
      DashboardHelpers.waitLoadingGHODashboard();
      DashboardHelpers.getApyBorrowRate(gho.shortName).then(($val) => {
        console.log($val);
        baseApy = $val;
        expect(baseApy).to.be.eql(gho.apy.max);
      });
    });
    TenderlyActions.tenderlyTokenRequest(tokenSet({ aAAVE: 10 }));
    DashboardActions.borrow(testData.borrow);
    it(`Check that borrowed APY is ${gho.apy.max}%`, () => {
      //borrow 100 GHO
      DashboardHelpers.getApyBorrowRate(gho.shortName).then(($val) => {
        expect($val).to.be.eql(gho.apy.max);
      });
      DashboardHelpers.getApyBorrowedRate(gho.shortName).then(($val) => {
        expect($val).to.be.eql(gho.apy.max);
      });
    });
  });
  describe(`Check APY with discount and unstake`, () => {
    configEnvWithTenderlyGoerliGhoFork({
      v3: true,
      tokens: tokenSet({ stkAave: 3, aAAVE: 1 }),
    });
    it(`Check APY rate from dashboard with max discount ${gho.apy.min}% for borrow`, () => {
      DashboardHelpers.waitLoadingGHODashboard(gho.apy.min);
      DashboardHelpers.getApyBorrowRate(gho.shortName).then(($val) => {
        expect($val).to.be.eql(gho.apy.min);
      });
    });
    TenderlyActions.tenderlyTokenRequest(tokenSet({ aAAVE: 2 }));
    DashboardActions.borrow(testData.borrow);
    it(`Check APY rate from dashboard with max discount ${gho.apy.min}% for borrowed, and that borrow APY go up`, () => {
      DashboardHelpers.getApyBorrowedRate(gho.shortName).then(($val) => {
        expect($val).to.be.eql(gho.apy.min);
      });
      DashboardHelpers.getApyBorrowRate(gho.shortName).then(($val) => {
        expect($val).to.be.lessThan(gho.apy.min);
        expect($val).to.be.greaterThan(gho.apy.min);
      });
    });
    TenderlyActions.tenderlyTokenWithdraw(tokenSet({ stkAave: 3 }));
    it(`Check that APY rate grow till max ${gho.apy.max}% after unstake`, () => {
      cy.wait(1000); //wait update of dashboard
      DashboardHelpers.getApyBorrowedRate(gho.shortName).then(($val) => {
        expect($val).to.be.eql(gho.apy.max);
      });
      DashboardHelpers.getApyBorrowRate(gho.shortName).then(($val) => {
        expect($val).to.be.eql(gho.apy.max);
      });
    });
  });
  describe(`Check borrowed APY updating`, () => {
    configEnvWithTenderlyGoerliGhoFork({
      v3: true,
      tokens: tokenSet({ stkAave: 3, aAAVE: 1 }),
    });
    it(`Check APY rate from dashboard with max discount ${gho.apy.min}% for borrow`, () => {
      DashboardHelpers.waitLoadingGHODashboard(gho.apy.min);
      DashboardHelpers.getApyBorrowRate(gho.shortName).then(($val) => {
        expect($val).to.be.eql(gho.apy.min);
      });
    });
    TenderlyActions.tenderlyTokenRequest(tokenSet({ aAAVE: 2 }));
    DashboardActions.borrow(testData.borrow);
    it(`Check APY rate from dashboard with max discount ${gho.apy.min}% for borrowed, and that borrow APY go up`, () => {
      DashboardHelpers.getApyBorrowedRate(gho.shortName).then(($val) => {
        expect($val).to.be.eql(gho.apy.min);
      });
    });
    TenderlyActions.tenderlyTokenRequest(tokenSet({ aAAVE: 10 }));
    DashboardActions.borrow(testData.borrow2);
    it(`Check that borrowed APY was grow`, () => {
      cy.wait(1000); //wait update of dashboard
      DashboardHelpers.getApyBorrowedRate(gho.shortName).then(($val) => {
        expect($val).to.be.greaterThan(gho.apy.min);
      });
    });
  });
});
