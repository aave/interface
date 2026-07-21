import './commands';

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('Account is not connected')) {
    return false;
  }
});

// Stub the compliance check both before() and beforeEach()
// A test that specifically covers the modal can override this with
// its own later cy.intercept later if needed
const stubComplianceCheck = () => {
  cy.intercept('GET', /\/api\/preflight-compliance/, {
    statusCode: 200,
    body: {
      result: true,
      nextCheck: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    },
  });
};

before(stubComplianceCheck);
beforeEach(stubComplianceCheck);
