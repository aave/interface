import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { DashboardActions } from '../../../support/actions/dashboard.actions';
import { TenderlyActions } from '../../../support/actions/tenderly.actions';
import { DashboardHelpers } from '../../../support/helpers/dashboard.helper';
import { configEnvWithTenderlyGoerliGhoFork } from '../../../support/steps/configuration.steps';
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
  const maxGHOApy = 2.02;
  const minGHOApy = 1.62;
  let baseApy: number;

  describe(`Verify default APY for GHO`, () => {
    configEnvWithTenderlyGoerliGhoFork({
      v3: true,
    });
    it(`Check APY rate from dashboard is ${maxGHOApy}%`, () => {
      DashboardHelpers.waitLoadingGHODashboard();
      DashboardHelpers.getApyBorrowRate(assets.ghoV3Market.GHO.shortName).then(($val) => {
        console.log($val);
        baseApy = $val;
        expect(baseApy).to.be.eql(maxGHOApy);
      });
    });
    TenderlyActions.tenderlyTokenRequest(tokenSet({ aAAVE: 10 }));
    DashboardActions.borrow(testData.borrow);
    it(`Check that borrowed APY is ${maxGHOApy}%`, () => {
      //borrow 100 GHO
      DashboardHelpers.getApyBorrowRate(assets.ghoV3Market.GHO.shortName).then(($val) => {
        expect($val).to.be.eql(maxGHOApy);
      });
      DashboardHelpers.getApyBorrowedRate(assets.ghoV3Market.GHO.shortName).then(($val) => {
        expect($val).to.be.eql(maxGHOApy);
      });
    });
  });
  describe(`Check APY with discount and unstake`, () => {
    configEnvWithTenderlyGoerliGhoFork({
      v3: true,
      tokens: tokenSet({ stkAave: 3, aAAVE: 1 }),
    });
    it(`Check APY rate from dashboard with max discount ${minGHOApy}% for borrow`, () => {
      DashboardHelpers.waitLoadingGHODashboard(minGHOApy);
      DashboardHelpers.getApyBorrowRate(assets.ghoV3Market.GHO.shortName).then(($val) => {
        expect($val).to.be.eql(minGHOApy);
      });
    });
    TenderlyActions.tenderlyTokenRequest(tokenSet({ aAAVE: 2 }));
    DashboardActions.borrow(testData.borrow);
    it(`Check APY rate from dashboard with max discount ${minGHOApy}% for borrowed, and that borrow APY go up`, () => {
      DashboardHelpers.getApyBorrowedRate(assets.ghoV3Market.GHO.shortName).then(($val) => {
        expect($val).to.be.eql(minGHOApy);
      });
      DashboardHelpers.getApyBorrowRate(assets.ghoV3Market.GHO.shortName).then(($val) => {
        expect($val).to.be.lessThan(maxGHOApy);
        expect($val).to.be.greaterThan(minGHOApy);
      });
    });
    TenderlyActions.tenderlyTokenWithdraw(tokenSet({ stkAave: 3 }));
    it(`Check that APY rate grow till max ${maxGHOApy}% after unstake`, () => {
      cy.wait(1000); //wait update of dashboard
      DashboardHelpers.getApyBorrowedRate(assets.ghoV3Market.GHO.shortName).then(($val) => {
        expect($val).to.be.eql(maxGHOApy);
      });
      DashboardHelpers.getApyBorrowRate(assets.ghoV3Market.GHO.shortName).then(($val) => {
        expect($val).to.be.eql(maxGHOApy);
      });
    });
  });
  describe(`Check borrowed APY updating`, () => {
    configEnvWithTenderlyGoerliGhoFork({
      v3: true,
      tokens: tokenSet({ stkAave: 3, aAAVE: 1 }),
    });
    it(`Check APY rate from dashboard with max discount ${minGHOApy}% for borrow`, () => {
      DashboardHelpers.waitLoadingGHODashboard(minGHOApy);
      DashboardHelpers.getApyBorrowRate(assets.ghoV3Market.GHO.shortName).then(($val) => {
        expect($val).to.be.eql(minGHOApy);
      });
    });
    TenderlyActions.tenderlyTokenRequest(tokenSet({ aAAVE: 2 }));
    DashboardActions.borrow(testData.borrow);
    it(`Check APY rate from dashboard with max discount ${minGHOApy}% for borrowed, and that borrow APY go up`, () => {
      DashboardHelpers.getApyBorrowedRate(assets.ghoV3Market.GHO.shortName).then(($val) => {
        expect($val).to.be.eql(minGHOApy);
      });
    });
    TenderlyActions.tenderlyTokenRequest(tokenSet({ aAAVE: 10 }));
    DashboardActions.borrow(testData.borrow2);
    it(`Check that borrowed APY was grow`, () => {
      cy.wait(1000); //wait update of dashboard
      DashboardHelpers.getApyBorrowedRate(assets.ghoV3Market.GHO.shortName).then(($val) => {
        expect($val).to.be.greaterThan(minGHOApy);
      });
    });
  });
});
