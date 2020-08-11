Feature: active pre tags

  When writing active blocks in a Markdown document
  I want to be able to make pre tags active
  So that I don't have to litter my document with <a> tags


  Background:
    Given my source code contains the HelloWorld action


  Scenario: pre tag
    Given my source code contains the file "1.md" with content:
      """
      <pre textrun="HelloWorld">
      foo
      </pre>
      """
    When running text-run
    Then it signals:
      | FILENAME | 1.md        |
      | LINE     | 1           |
      | MESSAGE  | Hello world |