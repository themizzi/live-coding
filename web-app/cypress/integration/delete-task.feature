Feature: In order to track things I no longer have to do
  As a user
  I want to delete a task

  Scenario: Delete a task
    When I visit the homepage with a task "Task to delete"
    And I click on the delete button for the task
    Then I do not see "Task to delete" in my list
    And the task is no longer saved to the backend
