import {When, Then} from 'cypress-cucumber-preprocessor/steps';

interface Backend {
  checkTaskSaved(): void;
  setupBackend(task: string): void;
}

const localStorageBackend: Backend = {
  checkTaskSaved() {
    cy.window().then(win => {
      const items = JSON.parse(win.localStorage.getItem('items') ?? '[]');
      expect(items.items[0]).to.equal(undefined);
    });
  },

  setupBackend(task) {
    cy.visit('', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'items',
          JSON.stringify({items: [{title: task, id: 1}], incrementor: 1})
        );
      },
    });
  },
};

const inMemoryBackend: Backend = {
  checkTaskSaved() {
    cy.window().then(win => {
      const items = ((win as unknown) as {items: {items: [undefined]}}).items;
      expect(items.items[0]).to.equal(undefined);
    });
  },

  setupBackend(task) {
    cy.visit('/', {
      onBeforeLoad(win) {
        ((win as unknown) as {
          items: {items: [{title: string; id: number}]; incrementor: number};
        }).items = {
          items: [
            {
              title: task,
              id: 1,
            },
          ],
          incrementor: 1,
        };
      },
    });
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

When('I visit the homepage with a task {string}', task => {
  getBackend().setupBackend(task);
});

When('I click on the delete button for the task', () => {
  cy.get('#task-list').find('#delete-task').click();
});

Then('I do not see {string} in my list', task => {
  cy.get('#task-list').contains(task).should('not.exist');
});

Then('the task is no longer saved to the backend', () => {
  getBackend().checkTaskSaved();
});
