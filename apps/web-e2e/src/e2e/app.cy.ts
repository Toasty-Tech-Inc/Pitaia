import { getGreeting } from '../support/app.po';

describe('web-e2e', () => {
  beforeEach(() => cy.visit('/login'));

  it('should not display welcome message', () => {
    cy.login('my-email@something.com', 'myPassword');

    getGreeting().contains("Login");
  });
});
