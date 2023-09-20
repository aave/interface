import assets from '../../fixtures/assets.json';
import constants from '../../fixtures/constans.json';
import { DashboardActions } from '../../support/actions/dashboard.actions';
import { TenderlyActions } from '../../support/actions/tenderly.actions';
import { DashboardHelpers } from '../../support/helpers/dashboard.helper';
import { configEnvWithTenderlyAEthereumV3Fork } from '../../support/steps/configuration.steps';
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
    amount: 200,
    apyType: constants.borrowAPYType.default,
    hasApproval: true,
  },
  borrow3: {
    asset: assets.ghoV3Market.GHO,
    amount: 1000,
    apyType: constants.borrowAPYType.default,
    hasApproval: true,
  },
};

// too slow for CI execution
describe.skip(`GHO DASHBOARD APY TESTING`, () => {
  describe(`Verify max APY for GHO`, () => {
    configEnvWithTenderlyAEthereumV3Fork({ v3: true });

    it(`Check APY rate from dashboard min = ${gho.apy.min}% and max = ${gho.apy.max}%`, () => {
      DashboardHelpers.waitLoadingGHODashboardRange();

      cy.waitUntil(() =>
        DashboardHelpers.getGhoApyBorrowRangeMin(gho.shortName).then(($val) => $val === gho.apy.min)
      );

      cy.waitUntil(() =>
        DashboardHelpers.getGhoApyBorrowRangeMax(gho.shortName).then(($val) => $val === gho.apy.max)
      );
    });

    TenderlyActions.tenderlyTokenRequest(tokenSet({ aDAI: 9000 }));
    DashboardActions.borrow(testData.borrow);

    it(`Check that borrowed APY is max = ${gho.apy.max}%`, () => {
      DashboardHelpers.waitLoadingGHOBorrowedAmount();

      cy.waitUntil(() =>
        DashboardHelpers.getGhoApyBorrowRangeMin(gho.shortName).then(($val) => $val === gho.apy.min)
      );

      cy.waitUntil(() =>
        DashboardHelpers.getGhoApyBorrowRangeMax(gho.shortName).then(($val) => $val === gho.apy.max)
      );

      cy.waitUntil(() =>
        DashboardHelpers.getApyBorrowedRate(gho.shortName).then(($val) => $val === gho.apy.max)
      );
    });
  });

  describe(`Verify min APY for GHO`, () => {
    configEnvWithTenderlyAEthereumV3Fork({
      v3: true,
      tokens: tokenSet({ stkAave: 6, aDAI: 500 }),
    });

    it(`Check APY rate from dashboard is min = ${gho.apy.min}%`, () => {
      DashboardHelpers.waitLoadingGHODashboard(gho.apy.min);

      cy.waitUntil(() =>
        DashboardHelpers.getApyBorrowRate(gho.shortName).then(($val) => $val === gho.apy.min)
      );
    });

    DashboardActions.borrow(testData.borrow);

    it(`Check that borrowed APY is min = ${gho.apy.min}%`, () => {
      DashboardHelpers.waitLoadingGHOBorrowedAmount();

      cy.waitUntil(() =>
        DashboardHelpers.getApyBorrowRate(gho.shortName).then(($val) => $val === gho.apy.min)
      );

      cy.waitUntil(() =>
        DashboardHelpers.getApyBorrowedRate(gho.shortName).then(($val) => $val === gho.apy.min)
      );
    });
  });

  //too slow for CI
  describe(`Verify APY range for GHO`, () => {
    describe(`APY range: min = ${gho.apy.min}% - low then ${gho.apy.max}%`, () => {
      configEnvWithTenderlyAEthereumV3Fork({
        v3: true,
        tokens: tokenSet({ stkAave: 1, aDAI: 500 }),
      });

      it(`Check APY range for borrow, min = ${gho.apy.min}% - low then ${gho.apy.max}%`, () => {
        cy.waitUntil(() =>
          DashboardHelpers.getGhoApyBorrowRangeMin(gho.shortName).then(
            ($val) => $val === gho.apy.min
          )
        );
        cy.waitUntil(() =>
          DashboardHelpers.getGhoApyBorrowRangeMax(gho.shortName).then(($val) => $val < gho.apy.max)
        );
      });

      DashboardActions.borrow(testData.borrow);

      it(`Check APY range for borrow, min = ${gho.apy.min}% - low then ${gho.apy.max}%;
            borrowed apy have to be ${gho.apy.min}%`, () => {
        DashboardHelpers.waitLoadingGHOBorrowedAmount();
        cy.waitUntil(() =>
          DashboardHelpers.getApyBorrowedRate(gho.shortName).then(($val) => $val === gho.apy.min)
        );
        cy.waitUntil(() =>
          DashboardHelpers.getGhoApyBorrowRangeMin(gho.shortName).then(
            ($val) => $val === gho.apy.min
          )
        );
        cy.waitUntil(() =>
          DashboardHelpers.getGhoApyBorrowRangeMax(gho.shortName).then(($val) => $val < gho.apy.max)
        );
      });
    });

    describe.skip(`APY range: higher then ${gho.apy.min}% - low then ${gho.apy.max}%`, () => {
      configEnvWithTenderlyAEthereumV3Fork({
        v3: true,
        tokens: tokenSet({ stkAave: 1, aDAI: 500 }),
      });

      DashboardActions.borrow(testData.borrow2);

      it(`Check APY range for borrow, higher then ${gho.apy.min}% - low then ${gho.apy.max}%;
            borrowed apy have to be higher then ${gho.apy.min}%`, () => {
        DashboardHelpers.waitLoadingGHOBorrowedAmount();
        cy.waitUntil(() =>
          DashboardHelpers.getApyBorrowedRate(gho.shortName).then(($val) => $val > gho.apy.min)
        );
        cy.waitUntil(() =>
          DashboardHelpers.getGhoApyBorrowRangeMin(gho.shortName).then(($val) => $val > gho.apy.min)
        );
        cy.waitUntil(() =>
          DashboardHelpers.getGhoApyBorrowRangeMax(gho.shortName).then(($val) => $val < gho.apy.max)
        );
      });
    });

    describe.skip(`APY range: min = ${gho.apy.min}% - max = ${gho.apy.max}%`, () => {
      configEnvWithTenderlyAEthereumV3Fork({
        v3: true,
        tokens: tokenSet({ stkAave: 1.01, aDAI: 12000 }),
      });

      DashboardActions.borrow(testData.borrow);

      it(`Check APY range for borrow, min = ${gho.apy.min}% - max = ${gho.apy.max}%;
            borrowed apy have to be min = ${gho.apy.min}%`, () => {
        DashboardHelpers.waitLoadingGHOBorrowedAmount();
        cy.waitUntil(() =>
          DashboardHelpers.getApyBorrowedRate(gho.shortName).then(($val) => $val === gho.apy.min)
        );
        cy.waitUntil(() =>
          DashboardHelpers.getGhoApyBorrowRangeMin(gho.shortName).then(
            ($val) => $val === gho.apy.min
          )
        );
        cy.waitUntil(() =>
          DashboardHelpers.getGhoApyBorrowRangeMax(gho.shortName).then(
            ($val) => $val === gho.apy.max
          )
        );
      });
    });
  });

  //too slow for CI
  describe.skip(`Verify APY updating for borrowed GHO`, () => {
    let stepBackAPY: number;
    configEnvWithTenderlyAEthereumV3Fork({
      v3: true,
      tokens: tokenSet({ stkAave: 3, aDAI: 300 }),
    });
    it(`Check APY rate from dashboard with max discount ${gho.apy.min}% for borrow`, () => {
      DashboardHelpers.waitLoadingGHODashboard(gho.apy.min);
      DashboardHelpers.getApyBorrowRate(gho.shortName).then(($val) => {
        expect($val).to.be.eql(gho.apy.min);
        stepBackAPY = $val;
      });
    });
    TenderlyActions.tenderlyTokenRequest(tokenSet({ aDAI: 600 }));
    DashboardActions.borrow(testData.borrow);
    it(`Check APY rate from dashboard with max discount ${gho.apy.min}% for borrowed, and that borrow APY go up`, () => {
      DashboardHelpers.waitLoadingGHOBorrowedAmount();
      DashboardHelpers.getApyBorrowedRate(gho.shortName).then(($val) => {
        expect($val).to.be.eql(gho.apy.min);
        expect($val).to.be.eql(stepBackAPY);
        stepBackAPY = $val;
      });
    });
    TenderlyActions.tenderlyTokenRequest(tokenSet({ aDAI: 3000 }));
    DashboardActions.borrow(testData.borrow3);
    it(`Check that borrowed APY was grow`, () => {
      cy.wait(5000); //TODO: use waitUntil in getApyBorrowedRate
      DashboardHelpers.waitLoadingGHOBorrowedAmount();
      DashboardHelpers.waitUntilApyChanges(gho.shortName, stepBackAPY);
      DashboardHelpers.getApyBorrowedRate(gho.shortName).then(($val) => {
        expect($val).to.be.greaterThan(gho.apy.min);
        expect($val).to.be.greaterThan(stepBackAPY);
        stepBackAPY = $val;
      });
    });
    TenderlyActions.tenderlyTokenWithdraw(tokenSet({ stkAave: 2 }));
    it(`Check that borrowed APY was grow after unstake`, () => {
      cy.wait(5000); //TODO: use waitUntil in getApyBorrowedRate
      DashboardHelpers.waitLoadingGHOBorrowedAmount();
      DashboardHelpers.waitUntilApyChanges(gho.shortName, stepBackAPY);
      DashboardHelpers.getApyBorrowedRate(gho.shortName).then(($val) => {
        expect($val).to.be.greaterThan(gho.apy.min);
        expect($val).to.be.greaterThan(stepBackAPY);
        stepBackAPY = $val;
      });
    });
    TenderlyActions.tenderlyTokenWithdraw(tokenSet({ stkAave: 1 }));
    it(`Check that borrowed APY was grow after fullunstake`, () => {
      cy.wait(5000); //wait update of dashboard
      DashboardHelpers.waitLoadingGHOBorrowedAmount();
      DashboardHelpers.waitUntilApyChanges(gho.shortName, stepBackAPY);
      DashboardHelpers.getApyBorrowedRate(gho.shortName).then(($val) => {
        expect($val).to.be.eql(gho.apy.max);
        expect($val).to.be.greaterThan(stepBackAPY);
      });
    });
  });
});
