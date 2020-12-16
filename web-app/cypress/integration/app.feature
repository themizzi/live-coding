Feature: In order to ensure the application always starts up
  As a user
  I want to verify success when loading the application

  Scenario: Successfully load the application
    When I visit the homepage
    Then there are no errors
