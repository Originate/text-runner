Feature: adding new handler functions

  When developing the test harness for my documentation
  I want to have the ability to generate new handler functions
  So that I don't need to copy-and-paste code.

  - run "text-run add <step-name>" to generate a new handler function for the given block


  @clionly
  Scenario: adding a new step
    When running "text-run add new-step"
    Then it generates the file "text-run/new-step.js" with content:
      """
      module.exports = async function ({formatter, searcher}) {

        // capture content from the document
        const content = searcher.tagContent('boldtext')

        // do something with the content
        formatter.output(content)
      }
      """