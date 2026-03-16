import './commands';

beforeEach(() => {
  cy.intercept('GET', '**/api/preflight-compliance?*', {
    statusCode: 200,
    body: {
      result: true,
      nextCheck: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    },
  });
});
