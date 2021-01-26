import {When, Then} from 'cypress-cucumber-preprocessor/steps';

interface Backend {
  checkTaskSaved(task: string): void;
  setupBackend(): void;
}

const localStorageBackend = {
  checkTaskSaved(task: string) {
    cy.window().then(win => {
      const items = JSON.parse(win.localStorage.getItem('items') ?? '[]');
      expect(items.items[0].title).to.equal(task);
    });
  },

  setupBackend() {
    cy.visit('', {
      onBeforeLoad(win) {
        win.localStorage.removeItem('items');
      },
    });
  },
};

const inMemoryBackend = {
  checkTaskSaved(task: string) {
    cy.window().then(win => {
      const items = ((win as unknown) as {items: {items: [{title: string}]}})
        .items;
      expect(items.items[0]?.title).to.equal(task);
    });
  },

  setupBackend() {
    cy.visit('/');
  },
};

const backends: {[key: string]: Backend} = {
  localStorage: localStorageBackend,
  inMemory: inMemoryBackend,
};

const getBackend = () => {
  const backendEnv = Cypress.env('backend');
  const backendKey = backendEnv ? backendEnv : 'localStorage';
  if (backends[backendKey]) {
    return backends[backendKey];
  }
  throw `Backend ${backendKey} not found`;
};

When('I visit the homepage', () => {
  getBackend().setupBackend();
});

When('I enter {string} into the add task input', task => {
  cy.get('#task-list')
    .find('#add-task')
    .type(task + '{enter}');
});

Then('I see {string} in my list', task => {
  cy.get('#task-list').contains(task);
});

Then('{string} is saved to the backend', task => {
  getBackend().checkTaskSaved(task);
});
