import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { DashboardActions } from '../../../support/actions/dashboard.actions';
import { TenderlyActions, TokenRequest } from '../../../support/actions/tenderly.actions';
import { DashboardHelpers } from '../../../support/helpers/dashboard.helper';
import { configEnvWithTenderlyGoerliGhoFork } from '../../../support/steps/configuration.steps';
import donors from './fixtures/donors.json';

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

const tokenSet = ({ stkAave = 0, aAAVE = 0 }) => {
  const tokenRequest: TokenRequest[] = [];
  if (stkAave != 0) {
    tokenRequest.push({
      tokenAddress: donors.stkAAVE.tokenAddress,
      donorAddress: donors.stkAAVE.donorWalletAddress,
      tokenCount: stkAave.toString(),
    });
  }
  if (aAAVE != 0) {
    tokenRequest.push({
      tokenAddress: donors.aAAVE.tokenAddress,
      donorAddress: donors.aAAVE.donorWalletAddress,
      tokenCount: aAAVE.toString(),
    });
  }
  return tokenRequest;
};


describe(`GHO discount integrating testing`, () => {
  const maxGHOApy = 2;
  const minGHOApy = 1.6;
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
      tokens: tokenSet({ aAAVE: 1, stkAave: 3 }),
    });
    it(`Check APY rate from dashboard with max discount ${minGHOApy}% for borrow`, () => {
      DashboardHelpers.waitLoadingGHODashboard();
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
      cy.wait(3000);
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
      tokens: tokenSet({ aAAVE: 1, stkAave: 3 }),
    });
    it(`Check APY rate from dashboard with max discount ${minGHOApy}% for borrow`, () => {
      DashboardHelpers.waitLoadingGHODashboard();
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
      cy.wait(1000);
      DashboardHelpers.getApyBorrowedRate(assets.ghoV3Market.GHO.shortName).then(($val) => {
        expect($val).to.be.greaterThan(minGHOApy);
      });
    });
  });
});
