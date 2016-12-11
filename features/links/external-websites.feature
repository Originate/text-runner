Feature: verifying links to websites

  As a tutorial writer
  I want to know whether links to websites work
  So that I can point my readers to further reading.

  - links pointing to non-existing external websites cause a warning


  Scenario: link to existing website
    Given my workspace contains the file "1.md" with the content:
      """
      A [working external link](http://google.com)
      """
    When running tut-run
    Then it signals:
      | FILENAME | 1.md                                       |
      | LINE     | 1                                          |
      | MESSAGE  | link to external website http://google.com |


  Scenario: link to non-existing website
    Given my workspace contains the file "1.md" with the content:
      """
      A [broken external link](http://oeanuthaoenuthoaeuzonk.com)
      """
    When running tut-run
    Then it signals:
      | FILENAME | 1.md                                                                    |
      | LINE     | 1                                                                       |
      | WARNING  | link to non-existing external website http://oeanuthaoenuthoaeuzonk.com |