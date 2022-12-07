import './commands';

before(() => {
  cy.intercept('GET', 'https://aave-api-v2.aave.com/addresses/status*', {
    statusCode: 200,
    body: {
      addressAllowed: true,
    },
  });
});
