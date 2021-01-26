Feature: In order to track things I am done doing
  As a user
  I want to mark a task as complete

  Scenario: Complete a task
    When I visit the homepage with a task "Task to complete"
    And I click on the complete button for the task
    Then I see 1 items completed in my list
    And the task is marked complete on the backend

  Scenario: See a completed task
    When I visit the homepage with a completed task "Completed task"
    And I click on the expand complete tasks button
    Then I see completed task "Completed task"

  Scenario: Uncomplete task
    When I visit the homepage with a completed task "Task to uncomplete"
    And I click on the expand complete tasks button
    And I click on the complete button for the task
    Then I do not see the completed tasks list
    And I see incomplete task "Task to uncomplete"
    And the task is marked incomplete on the backend
