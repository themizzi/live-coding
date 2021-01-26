import {When, Then} from 'cypress-cucumber-preprocessor/steps';

interface Backend {
  checkTaskCompleted(completed: boolean): void;
  setupBackend(task: string, completed?: boolean): void;
}

const localStorageBackend: Backend = {
  checkTaskCompleted(completed) {
    cy.window().then(win => {
      const items = JSON.parse(win.localStorage.getItem('items') ?? '[]');
      expect(items.items[0].completed).to.equal(completed);
    });
  },

  setupBackend(task, completed) {
    cy.visit('', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'items',
          JSON.stringify({
            items: [{title: task, id: 1, completed: completed}],
            incrementor: 1,
          })
        );
        console.log(
          'Local storage items set.',
          win.localStorage.getItem('items')
        );
      },
    });
  },
};

const inMemoryBackend: Backend = {
  checkTaskCompleted(completed) {
    cy.window().then(win => {
      const items = ((win as unknown) as {
        items: {items: [{completed: boolean}]};
      }).items;
      expect(items.items[0].completed).to.equal(completed);
    });
  },

  setupBackend(task, completed) {
    cy.visit('/', {
      onBeforeLoad(win) {
        ((win as unknown) as {
          items: {
            items: [
              {title: string; id: number; completed: boolean | undefined}
            ];
            incrementor: number;
          };
        }).items = {
          items: [
            {
              title: task,
              id: 1,
              completed: completed,
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
    console.log(`Cypress is using the ${backendKey} backend.`);
    return backends[backendKey];
  }
  throw `Backend ${backendKey} not found`;
};

When('I visit the homepage with a task {string}', task => {
  getBackend().setupBackend(task);
});

When('I visit the homepage with a completed task {string}', task => {
  getBackend().setupBackend(task, true);
});

When('I click on the complete button for the task', () => {
  cy.get('#item-1').get('#complete-task').click();
});

When('I click on the expand complete tasks button', () => {
  cy.get('#task-list').get('#expand-complete-tasks').click();
});

Then('I see {int} items completed in my list', items => {
  cy.get('#task-list').get('#completed-tasks').contains(`${items}`);
});

Then('I do not see the completed tasks list', () => {
  cy.get('#task-list').get('completed-tasks-list').should('not.exist');
});

Then('I see incomplete task {string}', task => {
  cy.get('#task-list')
    .get('#incomplete-tasks-list')
    .get('#item-1')
    .contains(task);
});

Then('I see completed task {string}', task => {
  cy.get('#task-list')
    .get('#completed-tasks-list')
    .get('#item-1')
    .contains(task);
});

Then('the task is marked complete on the backend', () => {
  getBackend().checkTaskCompleted(true);
});

Then('the task is marked incomplete on the backend', () => {
  getBackend().checkTaskCompleted(false);
});
