Feature: In order to track things I have to do
  As a user
  I want to add new things to do

  Scenario: Add a new task
    When I visit the homepage
    And I enter "New task" into the add task input
    Then I see "New task" in my list
    And "New task" is saved to the backend
