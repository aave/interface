import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

export const darkMode = () => {
  cy.get('#settings-button').click();
  cy.contains('Dark mode').click();
  cy.get('body').click(0, 0);
};
export const backgroundColour = (color: string) => {
  cy.get('body').should('have.css', 'background-color', `${color}`);
};

describe('Manipulation on the switching to dark mode', () => {
  describe('CASE1:Switch to Dark mode', () => {
    configEnvWithTenderlyMainnetFork({});

    it('step1: Enable dark mode', () => {
      darkMode();
    });

    it('step2: Check background color(dark)', () => {
      backgroundColour('rgb(27, 32, 48)');
    });

    it('step3: Disable dark mode', () => {
      darkMode();
    });

    it('step4: Check background color(default)', () => {
      backgroundColour('rgb(241, 241, 243)');
    });
  });
});
