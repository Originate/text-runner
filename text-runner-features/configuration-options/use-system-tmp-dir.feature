Feature: separate working directory

  Background:
    And the source code contains a file "text-run/print-cwd.js" with content:
      """
      module.exports = function(action) {
        action.log(process.cwd())
      }
      """
    Given the source code contains a file "print-cwd.md" with content:
      """
      <a type="printCWD"> </a>
      """


  @api
  Scenario: default configuration
    When calling Text-Runner
    Then it executes in the local "tmp" directory


  @cli
  Scenario: running in a local temp directory via config file
    Given the text-run configuration contains:
      """
      systemTmp: false
      """
    When running Text-Runner
    Then it runs in the local "tmp" directory


  @cli
  Scenario: running in a local temp directory via CLI
    Given the text-run configuration contains:
      """
      systemTmp: true
      """
    When running "text-run --no-system-tmp"
    Then it runs in the local "tmp" directory


  @api
  Scenario: running in a local temp directory via API
    When calling:
      """
      command = new textRunner.commands.Run({...config, systemTmp: false})
      observer = new MyObserverClass(command)
      await command.execute()
      """
    Then it executes in the local "tmp" directory


  @cli
  Scenario: running in a global temp directory via config file
    Given the text-run configuration contains:
      """
      systemTmp: true
      """
    When running Text-Runner
    Then it runs in a global temp directory


  @cli
  Scenario: running in a global temp directory via CLI
    When running "text-run --system-tmp *.md"
    Then it runs in a global temp directory


  @api
  Scenario: running in the global temp directory via API
    When calling:
      """
      command = new textRunner.commands.Run({...config, systemTmp: true})
      observer = new MyObserverClass(command)
      await command.execute()
      """
    Then it executes in a global temp directory
