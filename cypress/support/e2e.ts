import './commands';

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('Account is not connected')) {
    return false;
  }
});
