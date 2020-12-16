const {Then, When, Before} = require('cypress-cucumber-preprocessor/steps');

Before(() => {
  Cypress.on('window:before:load', win => {
    cy.spy(win.console, 'error');
  });
});

When('I visit the homepage', () => {
  cy.visit('');
});

Then('there are no errors', () => {
  cy.window().then(win => {
    expect(win.console.error).to.have.callCount(0);
  });
});
