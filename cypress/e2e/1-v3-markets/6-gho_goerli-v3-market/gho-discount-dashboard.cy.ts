import { Wallet } from "ethers";

import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { configEnvWithTenderlyGoerliGhoFork } from '../../../support/steps/configuration.steps';
import donors from './fixtures/donors.json';
import { Dashboard } from "../../../support/actions/dashboard";

type TokenRequest = {
  tokenAddress: string;
  donorAddress?: string;
  tokenCount?: string;
};

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

const tokenSet = ({ stkAave = 0, aAAVE = 0, gho = 0 }) => {
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


const getApyRate = (borrowed = false) => {

  cy.doSwitchToDashboardBorrowView();
  return cy
    .get(
      borrowed
        ? `[data-cy="dashboardBorrowedListItem_GHO_Variable"]`
        : `[data-cy="dashboardBorrowListItem_GHO"]`
    )
    .find(`[data-cy="apr"]`)
    .first()
    .then(($val) => {
      const _apy = parseFloat($val.text());
      cy.log(`APY rate is ${_apy}%`)
      return _apy;
    });
};

const tenderlyTokenRequest = (tokens: TokenRequest[], addressFrom?: string) => {
  return it(`Token request `, () => {
    Promise.all(
      tokens.map((token) => {
        const _addressFrom = addressFrom || token.donorAddress;
        cy.log(`donors.stkAAVE.donorWalletAddress ${donors.stkAAVE.donorWalletAddress}`)
        window.tenderly.getERC20Token(
          window.address,
          token.tokenAddress,
          _addressFrom,
          token.tokenCount
        );
      })
    );
    cy.refresh();
  });
};

const tenderlyTokenWithdraw = (tokens: TokenRequest[], addressTo?: string) => {
  return it(`Token withdraw `, () => {
    Promise.all(
      tokens.map((token) => {
        const wallet = Wallet.createRandom();
        const _addressTo = addressTo || wallet.address;
        window.tenderly.getERC20Token(
          _addressTo,
          token.tokenAddress,
          window.address,
          token.tokenCount
        );
      })
    );
    cy.refresh();
  });
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
      cy.wait(4000);
      getApyRate().then(($val) => {
        console.log($val);
        baseApy = $val;
        expect(baseApy).to.be.eql(maxGHOApy);
      });
    });
    tenderlyTokenRequest(tokenSet({ aAAVE: 10 }));
    Dashboard.borrow(testData.borrow);
    it(`Check that borrowed APY is ${maxGHOApy}%`, () => {
      //borrow 100 GHO
      getApyRate().then(($val) => {
        expect($val).to.be.eql(maxGHOApy);
      });
      getApyRate(true).then(($val) => {
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
      cy.wait(4000);
      getApyRate().then(($val) => {
        expect($val).to.be.eql(minGHOApy);
      });
    });
    tenderlyTokenRequest(tokenSet({ aAAVE: 2 }));
    Dashboard.borrow(testData.borrow);
    it(`Check APY rate from dashboard with max discount ${minGHOApy}% for borrowed, and that borrow APY go up`, () => {
      getApyRate(true).then(($val) => {
        expect($val).to.be.eql(minGHOApy);
      });
      getApyRate(false).then(($val) => {
        expect($val).to.be.lessThan(maxGHOApy);
        expect($val).to.be.greaterThan(minGHOApy);
      });
    });
    tenderlyTokenWithdraw(tokenSet({ stkAave: 3 }));
    it(`Check that APY rate grow till max ${maxGHOApy}% after unstake`, () => {
      cy.wait(1000);
      getApyRate(true).then(($val) => {
        expect($val).to.be.eql(maxGHOApy);
      });
      getApyRate(false).then(($val) => {
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
      cy.wait(4000);
      getApyRate().then(($val) => {
        expect($val).to.be.eql(minGHOApy);
      });
    });
    tenderlyTokenRequest(tokenSet({ aAAVE: 2 }));
    Dashboard.borrow(testData.borrow);
    it(`Check APY rate from dashboard with max discount ${minGHOApy}% for borrowed, and that borrow APY go up`, () => {
      getApyRate(true).then(($val) => {
        expect($val).to.be.eql(minGHOApy);
      });
    });
    tenderlyTokenRequest(tokenSet({ aAAVE: 10 }));
    Dashboard.borrow(testData.borrow2);
    it(`Check that borrowed APY was grow`, () => {
      cy.wait(1000);
      getApyRate(true).then(($val) => {
        expect($val).to.be.greaterThan(minGHOApy);
      });
    });
  });
});
