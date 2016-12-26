Feature: generating a configuration file

  As a TextRunner user setting up the tool on a new project
  I want to be able to generate a configuration file with the default options set
  So that I can run the tool successfully after customizing the options to my project's situation.

  - call "text-run setup" to generate a configuration file


  @clionly
  Scenario: running in a directory without configuration file
    When running the "setup" command
    Then it prints:
      """
      Create configuration file text-run.yml with default values
      """
    And it creates the file "text-run.yml" with the content:
      """
      files: '**/*.md'
      format: robust
      useTempDirectory: false

      actions:

        runConsoleCommand:
          globals: []
      """
